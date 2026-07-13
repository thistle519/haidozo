import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, notFound, serverError, rateLimited } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";

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

    // いいね連打対策のレート制限（ユーザー単位。1 分あたり 60 回まで）
    const limit = rateLimit(`like:${user.id}`, 60, 60_000);
    if (!limit.ok) {
      return rateLimited(limit.retryAfter);
    }

    // 投稿の存在確認（通知生成のため投稿者 user_id も取得）
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
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
      // いいね済み → 解除（delete はレースしても冪等）
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

      // いいね解除に伴い、自分が出したいいね通知を削除（失敗してもレスポンスは成功）
      const { error: notifDeleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("post_id", postId)
        .eq("actor_id", user.id)
        .eq("type", "like");
      if (notifDeleteError) {
        console.error(`[POST /api/posts/${postId}/like] Notification delete error:`, notifDeleteError);
      }
    } else {
      // 未いいね → 追加
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });

      if (insertError) {
        // 連打レースで二重 insert → PK(post_id,user_id) の一意制約違反(23505)。
        // 既にいいね済みとみなし liked=true で正常応答する。
        if (insertError.code === "23505") {
          liked = true;
        } else {
          console.error(`[POST /api/posts/${postId}/like] Insert error:`, insertError);
          return serverError();
        }
      } else {
        liked = true;

        // いいね成立時、投稿者宛に通知を生成（自分の投稿には作らない）。失敗してもレスポンスは成功。
        if (post.user_id && post.user_id !== user.id) {
          const { error: notifInsertError } = await supabase
            .from("notifications")
            .insert({
              recipient_id: post.user_id,
              actor_id: user.id,
              type: "like",
              post_id: postId,
            });
          if (notifInsertError) {
            console.error(`[POST /api/posts/${postId}/like] Notification insert error:`, notifInsertError);
          }
        }
      }
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
