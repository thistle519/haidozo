export type Relation = "恋人" | "友達" | "家族" | "上司" | "同僚" | "先生・恩師";
export type PriceRange = "〜3,000円" | "〜5,000円" | "〜10,000円" | "それ以上";
export type Scene = "誕生日" | "記念日" | "お礼" | "送別" | "手土産" | "なんでもない日" | "応援" | "結婚祝い";

export interface Post {
  id: string;
  userId?: string;   // DB上の投稿者ID（mockデータには無いため任意）
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
  vibes?: string[];    // このエピソードの何が素敵か（共感タグ）
  likes: number;
  date: string;
  url?: string;
  // 旧フィールド（移行用）
  note?: string;
  episode?: string;
}

// おもいめぐり：考え中のプラン（贈る相手単位の思考の途中経過）
export interface Plan {
  id: number;
  label: string;          // 呼び名（例：お母さん）空なら関係性を表示
  relation: Relation;
  scene: Scene | null;
  persona: string[];      // その人はどんな人
  loves: string[];        // その人の好きなもの（自由回答チップ）
  selectedIds: string[];  // 「この感じ、いいかも」したエピソード
  vibes: string[];        // たまった想いのかけら
  memo: string;           // 問いへの答えメモ
  wish: string;           // 想いの一文（こんなふうに喜んでほしい）
  savedAt: string;
}

// 通知（いいねイベント）。表示用に整形済み
export interface Notification {
  id: string;
  type: "like";
  user: string;        // いいねした人の表示名
  initial: string;     // 表示名の先頭1文字
  sub?: string;        // 対象投稿の item 名
  time: string;        // 相対時刻（「3分前」「2時間前」「6月10日」等）
  unread: boolean;
}
