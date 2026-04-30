export type Relation = "恋人" | "友達" | "家族" | "上司" | "同僚" | "先生・恩師";
export type PriceRange = "〜3,000円" | "〜5,000円" | "〜10,000円" | "それ以上";
export type Scene = "誕生日" | "記念日" | "お礼" | "送別" | "手土産" | "なんでもない日";

export interface Post {
  id: number;
  user: string;
  initial: string;
  item: string;
  relation: Relation;
  scene: Scene;
  price: PriceRange;
  about: string;       // 贈った相手のこと（この人はこういう人）
  reason: string;      // なぜこれを選んだか（必須）
  reaction?: string;   // 贈った時のこと（任意）
  persona?: string[];  // どんな人タグ（検索用）
  likes: number;
  date: string;
  url?: string;
  // 旧フィールド（移行用）
  note?: string;
  episode?: string;
}

export interface Notification {
  id: number;
  type: "like" | "follow";
  user: string;
  initial: string;
  text: string;
  sub?: string;
  time: string;
  unread: boolean;
}
