import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, notFound, serverError } from "@/lib/apiResponse";

/** UUID v4 形式チェック */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * POST /api/posts/[id]/like
 * 要認証。post_likes に自分のレコードが存在すれば削除（unlike）、
 * なければ挿入（like）するトグル動作。
 * レスポンス: { data: { liked: boolean, likes: number } }
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

    if (!isValidUuid(postId)) {
      return notFound();
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorized();
    }

    // 投稿の存在確認
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      if (postError?.code === "PGRST116") {
        return notFound();
      }
      console.error(`[POST /api/posts/${postId}/like] Post fetch error:`, postError);
      return serverError();
    }

    // 既存のいいねを確認
    const { data: existing, error: existingError } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error(`[POST /api/posts/${postId}/like] Like fetch error:`, existingError);
      return serverError();
    }

    let liked: boolean;

    if (existing) {
      // いいね済み → 解除
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error(`[POST /api/posts/${postId}/like] Delete error:`, deleteError);
        return serverError();
      }
      liked = false;
    } else {
      // 未いいね → 追加
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

      if (insertError) {
        console.error(`[POST /api/posts/${postId}/like] Insert error:`, insertError);
        return serverError();
      }
      liked = true;
    }

    // 最新のいいね数を取得
    const { count, error: countError } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (countError) {
      console.error(`[POST /api/posts/${postId}/like] Count error:`, countError);
      return serverError();
    }

    return ok({ liked, likes: count ?? 0 });
  } catch (err) {
    console.error("[POST /api/posts/[id]/like] Unexpected error:", err);
    return serverError();
  }
}
