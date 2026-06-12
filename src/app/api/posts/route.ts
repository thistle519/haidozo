import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  ok,
  apiError,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/apiResponse";
import { postCreateSchema } from "@/lib/validation";
import { toApiPost } from "@/types/db";
import type { DbPostWithRelations } from "@/types/db";

// GET クエリパラメータスキーマ
const feedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/posts?limit=&offset=
 * 全員閲覧可能なフィード。posts + profiles + いいね数 + ログイン時 likedByMe を返す。
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = feedQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { limit, offset } = parsed.data;

    const supabase = await createClient();

    // 認証チェック（任意：未ログインでも閲覧可）
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles!posts_user_id_fkey(name, avatar_url), post_likes(user_id)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[GET /api/posts] Supabase error:", error);
      return serverError();
    }

    const posts = (data as DbPostWithRelations[]).map((row) =>
      toApiPost(row, user?.id),
    );

    return ok(posts);
  } catch (err) {
    console.error("[GET /api/posts] Unexpected error:", err);
    return serverError();
  }
}

/**
 * POST /api/posts
 * 要認証。リクエストボディを postCreateSchema でバリデーション。
 * user_id は必ず getUser() の id を使用（body から受け取らない）。
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return unauthorized();
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(400, "invalid_body", "リクエストボディが不正です");
    }

    const parsed = postCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      item,
      relation,
      scene,
      price,
      about,
      reason,
      reaction,
      persona,
      vibes,
      imageUrl,
      url,
    } = parsed.data;

    const { data: inserted, error: insertError } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        item,
        relation,
        scene,
        price,
        about,
        reason,
        reaction: reaction ?? null,
        persona,
        vibes,
        image_url: imageUrl ?? null,
        url: url ?? null,
      })
      .select("*, profiles!posts_user_id_fkey(name, avatar_url), post_likes(user_id)")
      .single();

    if (insertError || !inserted) {
      console.error("[POST /api/posts] Insert error:", insertError);
      return serverError();
    }

    const dto = toApiPost(inserted as DbPostWithRelations, user.id);

    return ok(dto, { status: 201 });
  } catch (err) {
    console.error("[POST /api/posts] Unexpected error:", err);
    return serverError();
  }
}
