/**
 * インメモリの簡易レート制限（固定ウィンドウ方式）。
 *
 * 追加依存を避けるためプロセス内 Map で実装している。
 * ⚠️ 制約: サーバーレス/多インスタンス環境ではインスタンスごとに
 *   カウンタが分かれるため、グローバルな正確さは保証されない。
 *   本格運用では Upstash Ratelimit 等の外部ストア方式へ差し替えること。
 *   （ここでは主に /api/ogp の悪用（SSRF 探索・帯域浪費）緩和が目的）
 */

type Bucket = { count: number; resetAt: number };

// key（例: "ogp:1.2.3.4"）ごとの固定ウィンドウカウンタ
const buckets = new Map<string, Bucket>();

// メモリ肥大を防ぐため、期限切れバケットを間引く簡易掃除
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  /** 許可されたか */
  ok: boolean;
  /** 次にリセットされるまでの秒数（429 応答の Retry-After 用） */
  retryAfter: number;
}

/**
 * key 単位で固定ウィンドウのレート制限を判定する。
 * @param key    識別子（IP やユーザー ID を接頭辞付きで渡す）
 * @param limit  ウィンドウ内の許可回数
 * @param windowMs ウィンドウ長（ミリ秒）
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * リクエストからクライアント識別子（IP）を推定する。
 * プロキシ配下では x-forwarded-for の先頭を使う。取得できなければ "unknown"。
 */
export function clientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
