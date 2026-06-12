/**
 * API クライアント層
 * - 実装済み API Route との通信
 * - ApiPost → Post 変換
 * - Supabase Storage への画像アップロード
 */

import type { Post, Relation, Scene, PriceRange, Notification } from "@/types";
import type { ApiPost } from "@/types/db";
import { createClient } from "@/lib/supabase/client";

// ── 日付フォーマット ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 相対時刻フォーマット（「たった今」「3分前」「2時間前」「昨日」「6月10日」） */
function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "昨日";
  if (day < 7) return `${day}日前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ── ApiPost → Post 変換 ───────────────────────────────────────────────────────

function toPost(api: ApiPost): Post {
  return {
    id: api.id,
    userId: api.userId,
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

// ── notifications ───────────────────────────────────────────────────────────

/** API が返す通知行（actor 名・投稿 item を join 済み） */
interface ApiNotification {
  id: string;
  type: "like";
  actorName: string;
  actorInitial: string;
  postItem: string | null;
  read: boolean;
  createdAt: string;
}

/** 自分宛の通知を新しい順に取得（表示用 Notification に整形） */
export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  const body = (await res.json()) as { data: ApiNotification[] };
  return body.data.map((n) => ({
    id: n.id,
    type: n.type,
    user: n.actorName || "だれか",
    initial: n.actorInitial,
    sub: n.postItem ?? undefined,
    time: formatRelativeTime(n.createdAt),
    unread: !n.read,
  }));
}

/** 自分宛の未読通知をすべて既読にする */
export async function markNotificationsRead(): Promise<void> {
  const res = await fetch("/api/notifications", { method: "PATCH" });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

// ── deletePost ────────────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
}

// ── 認証ユーザー ──────────────────────────────────────────────────────────────

export interface CurrentUser {
  id: string;
  name: string;
  initial: string;
  avatarUrl?: string | null;
}

/** ログイン中ユーザーのプロフィールを取得（未ログインなら null） */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  const name = profile?.name || "わたし";
  return {
    id: user.id,
    name,
    initial: name.charAt(0) || "?",
    avatarUrl: profile?.avatar_url ?? null,
  };
}

/**
 * プロフィール（ニックネーム・アバター）を更新。
 * profiles は本人のみ update 可（RLS）。name はクライアント側でも trim・1〜50文字を検証。
 * 更新後の CurrentUser を返す。
 */
export async function updateProfile(input: {
  name: string;
  avatarUrl?: string | null;
}): Promise<CurrentUser> {
  const name = input.name.trim();
  if (name.length < 1) {
    throw new Error("ニックネームを入力してください");
  }
  if (name.length > 50) {
    throw new Error("ニックネームは50文字以内にしてください");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const patch: { name: string; avatar_url?: string | null } = { name };
  if (input.avatarUrl !== undefined) {
    patch.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message ?? "プロフィールの更新に失敗しました");
  }

  return {
    id: user.id,
    name,
    initial: name.charAt(0) || "?",
    avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : undefined,
  };
}

/** ログアウトしてログイン画面へ */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/auth/login";
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

// ── uploadAvatarImage ─────────────────────────────────────────────────────────

/** アバター画像を avatar-images バケットへアップロードし公開URLを返す（5MB・jpeg/png/webp） */
export async function uploadAvatarImage(
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
    .from("avatar-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(error.message ?? "画像のアップロードに失敗しました");
  }

  const { data } = supabase.storage.from("avatar-images").getPublicUrl(path);
  return data.publicUrl;
}
