import { createClient } from "@/lib/supabase/server";
import { ok, unauthorized, serverError } from "@/lib/apiResponse";

/** 通知 API の戻り行（actor 名と投稿 item を join 済み） */
export interface ApiNotification {
  id: string;
  type: "like";
  actorName: string;
  actorInitial: string;
  postItem: string | null;
  read: boolean;
  createdAt: string;
}

interface DbNotificationRow {
  id: string;
  type: "like";
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor: { name: string } | null;
  post: { item: string } | null;
}

/**
 * GET /api/notifications
 * 要認証。自分宛の通知を新しい順に最大50件返す。
 * レスポンス: { data: ApiNotification[] }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorized();
    }

    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, type, post_id, read, created_at, actor:profiles!notifications_actor_id_fkey(name), post:posts(item)",
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[GET /api/notifications] Supabase error:", error);
      return serverError();
    }

    const rows = (data ?? []) as unknown as DbNotificationRow[];
    const notifications: ApiNotification[] = rows.map((row) => {
      const name = row.actor?.name ?? "";
      return {
        id: row.id,
        type: row.type,
        actorName: name,
        actorInitial: name.charAt(0) || "?",
        postItem: row.post?.item ?? null,
        read: row.read,
        createdAt: row.created_at,
      };
    });

    return ok(notifications);
  } catch (err) {
    console.error("[GET /api/notifications] Unexpected error:", err);
    return serverError();
  }
}

/**
 * PATCH /api/notifications
 * 要認証。自分宛の未読通知をすべて read=true にする（既読化）。
 * レスポンス: { data: { updated: true } }
 */
export async function PATCH() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorized();
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    if (error) {
      console.error("[PATCH /api/notifications] Supabase error:", error);
      return serverError();
    }

    return ok({ updated: true });
  } catch (err) {
    console.error("[PATCH /api/notifications] Unexpected error:", err);
    return serverError();
  }
}
