import type { Post, Relation, PriceRange, Scene } from "@/types";

// あいまい入力 → 関連キーワード展開マップ
const KEYWORD_MAP: Record<string, string[]> = {
  // ── 直接入力されやすい単語 ──
  "香水":           ["香水", "フレグランス", "マルジェラ", "レプリカ", "香り"],
  "フレグランス":   ["フレグランス", "香水", "マルジェラ", "レプリカ", "香り"],
  "マルジェラ":     ["マルジェラ", "フレグランス", "香水", "ブランド", "おしゃれ"],
  "コーヒー":       ["コーヒー", "ブルーボトル", "カフェ", "インスタント", "エスプレッソ"],
  "紅茶":           ["紅茶", "ティー", "teapond", "TEAPOND", "ティータイム"],
  "カヌレ":         ["カヌレ", "スイーツ", "甘い", "食べ"],
  "出張":           ["出張", "旅先", "携帯", "旅", "インスタント"],
  "仕事":           ["仕事", "ハードワーク", "忙し", "切り替え"],
  "花":             ["花", "お花", "フラワー"],
  "お花":           ["花", "お花", "フラワー"],
  "ブルーボトル":   ["ブルーボトル", "コーヒー", "カフェ", "インスタント"],
  "プロ":           ["逆に", "プロ", "普段選ばない"],  // "コーヒーのプロだから違うものを"→紅茶系
  "違うもの":       ["逆に", "普段選ばない", "コーヒー"],
  // ── 形容詞・雰囲気系 ──
  "おしゃれ":       ["おしゃれ", "マルジェラ", "センス", "ブランド", "フレグランス", "香水"],
  "センスいい":     ["センス", "マルジェラ", "ブランド", "おしゃれ", "上品"],
  "かわいい":       ["かわいい", "可愛い", "ポーチ", "花", "カヌレ"],
  "実用的":         ["実用", "使える", "持ち歩", "便利", "ティーバッグ", "インスタント"],
  "さりげない":     ["さりげ", "小さめ", "添え", "ちょっとした", "気持ち"],
  "特別な":         ["特別", "大切", "記念", "ブランド", "マルジェラ"],
  // ── 食べ物・飲み物 ──
  "食べること好き": ["食べ", "カヌレ", "シュトーレン", "スイーツ", "グルメ", "ベーカリー"],
  "食いしん坊":     ["食べ", "カヌレ", "シュトーレン", "スイーツ", "グルメ"],
  "甘いもの好き":   ["カヌレ", "シュトーレン", "スイーツ", "ケーキ", "甘い"],
  "甘いもの":       ["カヌレ", "シュトーレン", "スイーツ", "甘い"],
  "グルメ":         ["グルメ", "カヌレ", "シュトーレン", "ベーカリー", "TAKIBI"],
  "コーヒー好き":   ["コーヒー", "ブルーボトル", "カフェ", "インスタント", "エスプレッソ"],
  "カフェ好き":     ["コーヒー", "ブルーボトル", "カフェ", "紅茶", "ティー", "teapond", "TEAPOND"],
  "紅茶好き":       ["紅茶", "ティー", "teapond", "TEAPOND"],
  "お茶好き":       ["紅茶", "ティー", "teapond", "コーヒー", "お茶"],
  "飲み物好き":     ["コーヒー", "紅茶", "ティー", "ブルーボトル", "teapond"],
  // ── ライフスタイル ──
  "ハードワーカー": ["ハードワーク", "忙し", "仕事", "切り替え", "辛", "出張"],
  "忙しそう":       ["忙し", "ハードワーク", "仕事", "出張", "辛"],
  "頑張ってる":     ["ハードワーク", "忙し", "頑張", "仕事", "辛"],
  "旅好き":         ["出張", "旅", "旅先", "持ってい", "携帯"],
  "出張多い":       ["出張", "旅先", "携帯", "持ってい"],
  "インドア":       ["家", "部屋", "インドア", "おうち", "ゆっくり"],
  "おうち好き":     ["家", "部屋", "おうち", "ゆっくり", "ティータイム"],
  "香り好き":       ["香り", "フレグランス", "香水", "アロマ", "マルジェラ", "レプリカ"],
  "花が好き":       ["花", "お花", "フラワー"],
  "ミニマリスト":   ["シンプル", "上品", "すっきり", "実用"],
  // ── 気持ち・状況 ──
  "サプライズ":     ["驚", "サプライズ", "急", "当日"],
  "思い出":         ["思い出", "記憶", "覚えて", "ずっと", "昔"],
  "感謝":           ["感謝", "ありがとう", "お礼", "お世話"],
};

// クエリをキーワードに展開する（「、」「,」「/」区切りで複数フレーズ対応）
export function expandQuery(query: string): string[] {
  const parts = query.split(/[、,/／\s]+/).map((s) => s.trim()).filter(Boolean);
  const allTerms: string[] = [];

  for (const part of parts) {
    allTerms.push(part);
    for (const [key, expansions] of Object.entries(KEYWORD_MAP)) {
      // 部分一致（双方向）
      if (part.includes(key) || key.includes(part)) {
        allTerms.push(...expansions);
      }
    }
    // 前方2文字マッチ（"コーヒーのプロ" → "コー" で "コーヒー" 系にヒット）
    for (const [key, expansions] of Object.entries(KEYWORD_MAP)) {
      const prefix = key.slice(0, 2);
      if (prefix.length === 2 && part.includes(prefix)) {
        allTerms.push(...expansions);
      }
    }
  }

  return [...new Set(allTerms)];
}

// 投稿の全テキストを結合
export function postFullText(post: Post): string {
  return [post.item, post.about, post.reason, post.reaction, ...(post.persona ?? [])].join(" ");
}

export interface SearchFilters {
  query: string;
  personaQuery: string;
  relation: Relation | null;
  scene: Scene | null;
  price: PriceRange | null;
  persona: string | null;
}

export function searchPosts(posts: Post[], filters: SearchFilters): Post[] {
  return posts.filter((p) => {
    // 関係性・シーン・価格は完全一致
    if (filters.relation && p.relation !== filters.relation) return false;
    if (filters.scene && p.scene !== filters.scene) return false;
    if (filters.price && p.price !== filters.price) return false;

    // personaチップ選択
    if (filters.persona && !p.persona?.includes(filters.persona)) return false;

    // フリーテキスト検索（キーワード展開あり）
    if (filters.query) {
      const expanded = expandQuery(filters.query);
      const text = postFullText(p);
      if (!expanded.some((kw) => text.includes(kw))) return false;
    }

    // どんな人？自由入力（キーワード展開あり）
    if (filters.personaQuery) {
      const expanded = expandQuery(filters.personaQuery);
      const text = postFullText(p);
      if (!expanded.some((kw) => text.includes(kw))) return false;
    }

    return true;
  });
}
