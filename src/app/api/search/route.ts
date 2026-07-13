import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, validationError, serverError, rateLimited } from "@/lib/apiResponse";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { searchQuerySchema } from "@/lib/validation";
import { expandQuery } from "@/lib/searchUtils";
import { toApiPost } from "@/types/db";
import type { DbPostWithRelations } from "@/types/db";

/**
 * PostgREST の .or() フィルタ文字列に埋め込む値をサニタイズする。
 *
 * ilike パターン内の %, _, (, ), " は PostgREST の構文に干渉するため削除する。
 * （SQL パラメータ化クエリで処理されるため SQLインジェクション自体のリスクは
 *  低いが、PostgREST の構文解析エラーや意図しないマッチを防ぐための措置。）
 */
function sanitizeForOrFilter(term: string): string {
  // 括弧・ダブルクォート・バックスラッシュ・カンマを除去
  return term.replace(/[(),"\\]/g, "");
}

/**
 * 検索キーワード群から PostgREST の .or() フィルタ文字列を組み立てる。
 *
 * 生成例（terms = ["コーヒー", "カフェ"]）:
 *   item.ilike.%コーヒー%,about.ilike.%コーヒー%,...,item.ilike.%カフェ%,...
 *
 * 配列フィールド（persona, vibes）は cs（contains） ではなく
 * PostgREST の `cs.{term}` 構文（配列が term を含む）を使う。
 *
 * @param terms  サニタイズ済みの検索語リスト
 */
function buildOrFilter(terms: string[]): string {
  const parts: string[] = [];

  for (const term of terms) {
    const safe = sanitizeForOrFilter(term);
    if (!safe) continue;

    // テキストフィールドの部分一致
    parts.push(`item.ilike.%${safe}%`);
    parts.push(`about.ilike.%${safe}%`);
    parts.push(`reason.ilike.%${safe}%`);
    parts.push(`reaction.ilike.%${safe}%`);

    // 配列フィールド: cs（contains）— PostgREST の `cs.{"term"}` 構文
    // ダブルクォートはサニタイズ済みなので安全
    parts.push(`persona.cs.{"${safe}"}`);
    parts.push(`vibes.cs.{"${safe}"}`);
  }

  return parts.join(",");
}

/**
 * GET /api/search?q=&relation=&scene=&price=&limit=&offset=
 *
 * 全員閲覧可能。searchQuerySchema でパース。
 * - relation / scene / price は .eq() で完全一致フィルタ
 * - q がある場合は expandQuery() でキーワード展開し、最大 10 語に絞って
 *   item / about / reason / reaction の ilike OR と
 *   persona / vibes 配列の cs（contains）を .or() で結合
 * - ログイン中なら searches テーブルにクエリを記録（失敗しても検索は返す）
 */
export async function GET(request: NextRequest) {
  try {
    // 検索は未ログインでも可のため IP 単位でレート制限（1 分あたり 60 回まで）
    const rl = rateLimit(`search:${clientKey(request)}`, 60, 60_000);
    if (!rl.ok) {
      return rateLimited(rl.retryAfter);
    }

    const { searchParams } = request.nextUrl;

    const parsed = searchQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      relation: searchParams.get("relation") ?? undefined,
      scene: searchParams.get("scene") ?? undefined,
      price: searchParams.get("price") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { q, relation, scene, price, limit, offset } = parsed.data;

    const supabase = await createClient();

    // 認証（任意：未ログインでも検索可）
    const { data: { user } } = await supabase.auth.getUser();

    // ── クエリ構築 ──────────────────────────────────────────────────────────

    let query = supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(name, avatar_url), post_likes(user_id)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 完全一致フィルタ
    if (relation) {
      query = query.eq("relation", relation);
    }
    if (scene) {
      query = query.eq("scene", scene);
    }
    if (price) {
      query = query.eq("price", price);
    }

    // フリーテキスト検索（キーワード展開 + OR フィルタ）
    if (q) {
      const expanded = expandQuery(q).slice(0, 10); // 最大 10 語
      if (expanded.length > 0) {
        const orFilter = buildOrFilter(expanded);
        if (orFilter) {
          query = query.or(orFilter);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[GET /api/search] Supabase error:", error);
      return serverError();
    }

    const posts = (data as DbPostWithRelations[]).map((row) =>
      toApiPost(row, user?.id),
    );

    // ── 検索ログ記録（ログイン中 + q がある場合） ──────────────────────────
    if (user && q) {
      supabase
        .from("searches")
        .insert({ user_id: user.id, query: q })
        .then(({ error: logError }) => {
          if (logError) {
            console.error("[GET /api/search] Search log error:", logError);
          }
        });
      // 失敗しても検索結果は返すため await しない
    }

    return ok(posts);
  } catch (err) {
    console.error("[GET /api/search] Unexpected error:", err);
    return serverError();
  }
}
