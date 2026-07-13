import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { request as httpRequest, type IncomingMessage, type RequestOptions } from "node:http";
import { request as httpsRequest } from "node:https";
import { rateLimit, clientKey } from "@/lib/rateLimit";

// Node ランタイムを明示（dns 解決に Node API を使うため Edge 不可）
export const runtime = "nodejs";

/**
 * OGP 画像取得エンドポイント。
 *
 * ⚠️ SSRF 対策の要点（外部 URL を fetch するため必須）:
 *  - スキームは http/https のみ許可
 *  - ホスト名を DNS 解決し、プライベート/ループバック/リンクローカル/
 *    予約アドレス（クラウドメタデータ 169.254.169.254 等）を拒否
 *  - Node の lookup を差し替え、TLS のホスト名検証は維持したまま検証済み IP に接続する
 *  - リダイレクトは manual にし、追跡せず 1 回のみ検証済み URL に接続
 *  - タイムアウト・本文サイズ上限を設ける
 *  - 例外時は常に { image: null }（内部エラーは漏らさない）
 */

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 512 * 1024; // 512KB
// OGP 取得は重い外部 fetch なので軽く制限（多インスタンス制約は rateLimit.ts 参照）
const RATE_LIMIT = 20; // 1 分あたり
const RATE_WINDOW_MS = 60_000;

/** 数値 IPv4 オクテットからプライベート/予約レンジ判定 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // パースできない値は安全側に倒して拒否
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 ループバック
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 リンクローカル（メタデータ）
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a >= 224) return true; // 224+ マルチキャスト/予約
  return false;
}

/** IPv6 のループバック/リンクローカル/ユニークローカル判定 */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // ループバック/未指定
  // IPv4-mapped（::ffff:127.0.0.1 等）は埋め込み IPv4 で判定
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (lower.startsWith("fe80")) return true; // fe80::/10 リンクローカル
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 ユニークローカル
  return false;
}

/**
 * ホスト名を解決し、すべての解決 IP が公開アドレスであることを検証する。
 * 安全なら接続先 IP を返し、危険なら null を返す。
 */
async function resolveSafeAddress(
  hostname: string,
): Promise<{ address: string; family: number } | null> {
  const host = hostname.toLowerCase();
  // localhost 等のリテラルは名前解決前に拒否
  if (host === "localhost" || host.endsWith(".localhost")) return null;

  // 全アドレスを取得し、1 つでも危険なら拒否
  const results = await lookup(hostname, { all: true });
  if (results.length === 0) return null;
  for (const { address, family } of results) {
    if (family === 4 && isPrivateIPv4(address)) return null;
    if (family === 6 && isPrivateIPv6(address)) return null;
  }
  // 検証済みの先頭アドレスへ接続（DNS リバインディング対策）
  return results[0];
}

/** URL 文字列を検証し、安全なら接続用情報を返す */
async function toSafeFetchTarget(
  raw: string,
): Promise<{ url: URL; address: string; family: number; host: string } | null> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const safe = await resolveSafeAddress(parsed.hostname);
  if (!safe) return null;

  return { url: parsed, address: safe.address, family: safe.family, host: parsed.host };
}

/** 検証済み IP に接続しつつ、Host/SNI は元 URL のホスト名を使って HTML を取得する */
async function requestWithPinnedLookup(
  target: { url: URL; address: string; family: number; host: string },
  signal: AbortSignal,
): Promise<IncomingMessage> {
  const transport = target.url.protocol === "https:" ? httpsRequest : httpRequest;
  const options: RequestOptions = {
    protocol: target.url.protocol,
    hostname: target.url.hostname,
    port: target.url.port || undefined,
    path: `${target.url.pathname}${target.url.search}`,
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; haidozo/1.0)",
      Host: target.host,
      Accept: "text/html",
    },
    lookup: (_hostname, options, callback) => {
      if (typeof options === "object" && options?.all) {
        callback(null, [{ address: target.address, family: target.family }]);
        return;
      }
      callback(null, target.address, target.family);
    },
    signal,
  };

  return new Promise((resolve, reject) => {
    const req = transport(options, resolve);
    req.setTimeout(FETCH_TIMEOUT_MS, () => {
      req.destroy(new Error("request_timeout"));
    });
    req.on("error", reject);
    req.end();
  });
}

/** サイズ上限付きで本文テキストを読む（超過分は打ち切る） */
async function readBodyLimited(res: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks, Math.min(total, MAX_BODY_BYTES)).toString("utf-8"));
    };

    res.on("data", (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const remaining = MAX_BODY_BYTES - total;
      if (remaining > 0) {
        chunks.push(buf.subarray(0, remaining));
        total += Math.min(buf.byteLength, remaining);
      }
      if (total >= MAX_BODY_BYTES) {
        finish();
        res.destroy();
      }
    });
    res.on("end", finish);
    res.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

function resolveImageUrl(image: string | null, pageUrl: URL): string | null {
  if (!image) return null;
  try {
    const resolved = new URL(image, pageUrl);
    if (resolved.protocol !== "https:" && resolved.protocol !== "http:") return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // 軽いレート制限（SSRF 探索・帯域浪費の緩和）
  const limit = rateLimit(`ogp:${clientKey(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    const res = NextResponse.json({ image: null }, { status: 429 });
    if (limit.retryAfter > 0) res.headers.set("Retry-After", String(limit.retryAfter));
    return res;
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ image: null });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const target = await toSafeFetchTarget(url);
    if (!target) return NextResponse.json({ image: null });

    const res = await requestWithPinnedLookup(target, controller.signal);

    // リダイレクト応答はここで終了（検証済みでない別ホストへ飛ばさない）
    if ((res.statusCode ?? 0) >= 300 && (res.statusCode ?? 0) < 400) {
      res.destroy();
      return NextResponse.json({ image: null });
    }

    // HTML でなければ画像抽出しない
    const contentType = String(res.headers["content-type"] ?? "");
    if (!contentType.toLowerCase().includes("text/html")) {
      res.destroy();
      return NextResponse.json({ image: null });
    }

    const html = await readBodyLimited(res);

    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const image = resolveImageUrl(match?.[1] ?? null, target.url);
    return NextResponse.json({ image });
  } catch {
    // タイムアウト・DNS 失敗・ネットワークエラー等はすべて null（詳細は漏らさない）
    return NextResponse.json({ image: null });
  } finally {
    clearTimeout(timer);
  }
}
