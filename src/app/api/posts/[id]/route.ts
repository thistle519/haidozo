import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ok,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/apiResponse";
import { toApiPost } from "@/types/db";
import type { DbPostWithRelations } from "@/types/db";

/** UUID v4 形式チェック */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * GET /api/posts/[id]
 * 全員閲覧可能。uuid 形式が不正、または存在しない場合は 404。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!isValidUuid(id)) {
      return notFound();
    }

    const supabase = await createClient();

    // 認証チェック（任意：未ログインでも閲覧可）
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(name, avatar_url), post_likes(user_id)")
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") {
        // PostgREST "The result contains 0 rows"
        return notFound();
      }
      console.error(`[GET /api/posts/${id}] Supabase error:`, error);
      return serverError();
    }

    const dto = toApiPost(data as DbPostWithRelations, user?.id);
    return ok(dto);
  } catch (err) {
    console.error("[GET /api/posts/[id]] Unexpected error:", err);
    return serverError();
  }
}

/**
 * DELETE /api/posts/[id]
 * 要認証。自分の投稿のみ削除可。
 * `.delete().eq("id", id).eq("user_id", user.id).select()` で対象 0 件なら 404
 * （RLS が最終防衛線だが API 側でも明示）。
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!isValidUuid(id)) {
      return notFound();
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      console.error(`[DELETE /api/posts/${id}] Supabase error:`, error);
      return serverError();
    }

    if (!data || data.length === 0) {
      // 存在しないか、他人の投稿（RLS が通さないため区別せず 404 を返す）
      return notFound();
    }

    return ok({ deleted: true });
  } catch (err) {
    console.error("[DELETE /api/posts/[id]] Unexpected error:", err);
    return serverError();
  }
}
