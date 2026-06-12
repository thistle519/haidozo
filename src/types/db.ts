/**
 * DB 行型と API DTO 型
 * - DbPost: supabase/migrations/0001_init.sql の posts テーブルと 1:1 対応
 * - ApiPost: クライアントに返す DTO（snake_case → camelCase 変換済み）
 */

import type { Relation, Scene, PriceRange } from "@/types";

// ── DB 行型 ────────────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface DbPost {
  id: string;
  user_id: string;
  item: string;
  relation: Relation;
  scene: Scene;
  price: PriceRange;
  about: string;
  reason: string;
  reaction: string | null;
  persona: string[];
  vibes: string[];
  image_url: string | null;
  url: string | null;
  created_at: string;
}

export interface DbPostLike {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface DbSearch {
  id: string;
  user_id: string | null;
  query: string;
  created_at: string;
}

// ── SELECT 結合型（posts + profiles + post_likes） ──────────────────────────

/** Supabase の `posts.select("*, profiles(name, avatar_url), post_likes(user_id)")` の戻り型 */
export interface DbPostWithRelations extends DbPost {
  profiles: {
    name: string;
    avatar_url: string | null;
  } | null;
  post_likes: { user_id: string }[];
}

// ── API DTO ────────────────────────────────────────────────────────────────

export interface ApiPost {
  id: string;
  userId: string;
  userName: string;
  /** 表示名の先頭1文字（アバター未設定時のフォールバック用） */
  userInitial: string;
  avatarUrl: string | null;
  item: string;
  relation: Relation;
  scene: Scene;
  price: PriceRange;
  about: string;
  reason: string;
  reaction?: string;
  persona: string[];
  vibes: string[];
  imageUrl: string | null;
  url: string | null;
  likes: number;
  likedByMe: boolean;
  createdAt: string;
}

// ── 変換ヘルパー ───────────────────────────────────────────────────────────

/**
 * DB 結合行を ApiPost DTO に変換する。
 * @param row  posts + profiles + post_likes の結合行
 * @param currentUserId  ログイン中ユーザーの id（未ログインなら null / undefined）
 */
export function toApiPost(
  row: DbPostWithRelations,
  currentUserId?: string | null,
): ApiPost {
  const name = row.profiles?.name ?? "";
  return {
    id: row.id,
    userId: row.user_id,
    userName: name,
    userInitial: name.charAt(0) || "?",
    avatarUrl: row.profiles?.avatar_url ?? null,
    item: row.item,
    relation: row.relation,
    scene: row.scene,
    price: row.price,
    about: row.about,
    reason: row.reason,
    reaction: row.reaction ?? undefined,
    persona: row.persona,
    vibes: row.vibes,
    imageUrl: row.image_url,
    url: row.url,
    likes: row.post_likes.length,
    likedByMe: currentUserId
      ? row.post_likes.some((l) => l.user_id === currentUserId)
      : false,
    createdAt: row.created_at,
  };
}
