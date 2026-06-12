/**
 * API クライアント層
 * - 実装済み API Route との通信
 * - ApiPost → Post 変換
 * - Supabase Storage への画像アップロード
 */

import type { Post, Relation, Scene, PriceRange } from "@/types";
import type { ApiPost } from "@/types/db";
import { createClient } from "@/lib/supabase/client";

// ── 日付フォーマット ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ── ApiPost → Post 変換 ───────────────────────────────────────────────────────

function toPost(api: ApiPost): Post {
  return {
    id: api.id,
    user: api.userName,
    initial: api.userInitial,
    item: api.item,
    relation: api.relation,
    scene: api.scene,
    price: api.price,
    about: api.about,
    reason: api.reason,
    reaction: api.reaction,
    persona: api.persona,
    vibes: api.vibes,
    likes: api.likes,
    date: formatDate(api.createdAt),
    url: api.url ?? undefined,
  };
}

// ── エラーハンドリング ────────────────────────────────────────────────────────

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? `エラーが発生しました（${res.status}）`;
  } catch {
    return `エラーが発生しました（${res.status}）`;
  }
}

// ── fetchFeed ─────────────────────────────────────────────────────────────────

export async function fetchFeed(): Promise<{
  posts: Post[];
  likedByMe: Record<string, boolean>;
}> {
  const res = await fetch("/api/posts", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const body = (await res.json()) as { data: ApiPost[] };
  const posts = body.data.map(toPost);
  const likedByMe: Record<string, boolean> = {};
  for (const api of body.data) {
    if (api.likedByMe) likedByMe[api.id] = true;
  }
  return { posts, likedByMe };
}

// ── createPost ────────────────────────────────────────────────────────────────

export interface CreatePostInput {
  item: string;
  relation: Relation;
  scene: Scene;
  price: PriceRange;
  about: string;
  reason: string;
  reaction?: string;
  persona?: string[];
  vibes?: string[];
  imageUrl?: string;
  url?: string;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const body = (await res.json()) as { data: ApiPost };
  return toPost(body.data);
}

// ── toggleLike ────────────────────────────────────────────────────────────────

/**
 * いいねトグル。API 側（POST /api/posts/[id]/like）がトグル動作のため
 * 常に POST。サーバの状態が正（楽観更新とずれた場合は戻り値で補正する）。
 */
export async function toggleLike(
  id: string,
): Promise<{ liked: boolean; likes: number }> {
  const res = await fetch(`/api/posts/${id}/like`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const body = (await res.json()) as { data: { liked: boolean; likes: number } };
  return body.data;
}

// ── deletePost ────────────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

// ── uploadPostImage ───────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadPostImage(
  file: File,
  userId: string,
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("jpeg・png・webp 形式の画像を選択してください");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("画像は5MB以下にしてください");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("gift-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message ?? "画像のアップロードに失敗しました");
  }

  const { data } = supabase.storage.from("gift-images").getPublicUrl(path);
  return data.publicUrl;
}
