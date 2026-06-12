import { z } from "zod";

// src/types/index.ts のユニオン型・DB CHECK 制約と必ず一致させること
export const RELATIONS = ["恋人", "友達", "家族", "上司", "同僚", "先生・恩師"] as const;
export const SCENES = ["誕生日", "記念日", "お礼", "送別", "手土産", "なんでもない日", "応援", "結婚祝い"] as const;
export const PRICES = ["〜3,000円", "〜5,000円", "〜10,000円", "それ以上"] as const;

export const postCreateSchema = z.object({
  item: z.string().trim().min(1, "贈ったものを入力してください").max(100),
  relation: z.enum(RELATIONS),
  scene: z.enum(SCENES),
  price: z.enum(PRICES),
  about: z.string().trim().max(500).default(""),
  reason: z.string().trim().min(1, "選んだ理由を入力してください").max(1000),
  reaction: z.string().trim().max(1000).optional(),
  persona: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  vibes: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  imageUrl: z.string().url().optional(),
  url: z.string().url().optional(),
});
export type PostCreateInput = z.infer<typeof postCreateSchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  relation: z.enum(RELATIONS).optional(),
  scene: z.enum(SCENES).optional(),
  price: z.enum(PRICES).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "ニックネームを入力してください").max(50),
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});
