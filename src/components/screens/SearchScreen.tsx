"use client";

import { useState, useMemo } from "react";
import type { Post, Relation, PriceRange, Scene } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import { expandQuery, postFullText } from "@/lib/searchUtils";
import { useOgpImage } from "@/lib/useOgpImage";
import PostTags from "@/components/ui/PostTags";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

// ────────────────────────────────────
// 定数
// ────────────────────────────────────
const RELATIONS: Relation[] = ["恋人", "友達", "家族", "先生・恩師", "同僚", "上司"];
const SCENES: Scene[] = ["誕生日", "送別", "お礼", "手土産", "なんでもない日", "記念日"];
const PRICES: PriceRange[] = ["〜3,000円", "〜5,000円", "〜10,000円", "それ以上"];

// ────────────────────────────────────
// インサイトテキスト
// ────────────────────────────────────
interface Insight { credo: string; tip: string[] }

const INSIGHT: Record<string, Insight> = {
  "友達_誕生日":        { credo: "使うたびに、贈った日を思い出してもらえるもの", tip: ["日常使いできるもの", "その人の趣味に関係するもの"] },
  "友達_なんでもない日": { credo: "何気ない日の、ちょっといい時間になるもの", tip: ["一緒に食べられるもの", "おうち時間が豊かになるもの"] },
  "友達_送別":          { credo: "新生活で、ふと思い出してもらえるもの", tip: ["新居でも使えるもの", "手元に残るもの"] },
  "友達_手土産":        { credo: "一緒にいる時間が、もっと楽しくなるもの", tip: ["その場でシェアできるもの", "見た目も可愛いもの"] },
  "友達_お礼":          { credo: "忙しい日常の、少し贅沢な息抜きになるもの", tip: ["普段自分では買わないもの", "ゆっくりできる時間に使えるもの"] },
  "先生・恩師_お礼":    { credo: "「あなただから選んだ」が自然と伝わるもの", tip: ["その人の仕事や趣味に関係するもの", "長く使えるもの"] },
  "先生・恩師_誕生日":  { credo: "忙しい合間に、ほっとできる時間をつくるもの", tip: ["さりげなく使えるもの", "季節感のあるもの"] },
  "先生・恩師_送別":    { credo: "これからの新しい時間を、豊かにしてくれるもの", tip: ["ふたりで楽しめるもの", "記念日に残るもの"] },
  "恋人_誕生日":        { credo: "「ちゃんと見てる」が、さりげなく伝わるもの", tip: ["相手が好きなブランドに関係するもの", "一緒に使えるもの"] },
  "家族_誕生日":        { credo: "毎日の中で、ふと幸せな気持ちになれるもの", tip: ["日常使いできるもの", "ちょっと贅沢なもの"] },
};

function getInsight(relation: Relation | null, scene: Scene | null): Insight | null {
  if (!relation || !scene) return null;
  const key = `${relation}_${scene}`;
  return INSIGHT[key] ?? { credo: "その人を想って選んだ、というのが伝わるもの", tip: ["相手の趣味に関係するもの", "日常使いできるもの"] };
}

// ────────────────────────────────────
// おすすめ店データ
// ────────────────────────────────────
interface Store { name: string; desc: string; url: string; tags: string[] }

const STORES: Store[] = [
  { name: "Blue Bottle Coffee", desc: "コーヒープレゼントセット", url: "https://store.bluebottlecoffee.jp", tags: ["コーヒー", "カフェ", "出張", "ハードワーク"] },
  { name: "TEAPOND", desc: "紅茶・ティープレゼント", url: "https://teapond.jp", tags: ["紅茶", "ティー", "インドア", "おうち"] },
  { name: "Maison Margiela", desc: "フレグランス・香水", url: "https://www.maisonmargiela.com/ja-jp", tags: ["おしゃれ", "香り", "フレグランス", "ブランド"] },
  { name: "立町カヌレ（Castagna）", desc: "カヌレプレゼントセット", url: "https://www.castagna.co.jp/pasticceria/cannelegiftset/", tags: ["スイーツ", "カヌレ", "甘い", "グルメ"] },
  { name: "TAKIBI BAKERY", desc: "クラフトベーカリー・焼き菓子", url: "https://csonline.cifaka.jp", tags: ["シュトーレン", "ベーカリー", "グルメ"] },
  { name: "Anny", desc: "プレゼント専門ECサイト", url: "https://anny.gift", tags: [] },
  { name: "TANP", desc: "プレゼント・贈り物選びサービス", url: "https://tanp.jp", tags: [] },
  { name: "お花の定期便 bloomee", desc: "お花プレゼント", url: "https://bloomeelife.com", tags: ["花", "フラワー", "お花"] },
];

function getStores(posts: Post[], query: string): Store[] {
  const postUrls = new Set(posts.map((p) => p.url).filter(Boolean));
  const fromPosts = STORES.filter((s) => [...postUrls].some((u) => u && u.includes(new URL(s.url).hostname.replace("www.", ""))));
  const expanded = query ? expandQuery(query) : [];
  const fromTags = STORES.filter(
    (s) => !fromPosts.includes(s) && (s.tags.length === 0 || s.tags.some((t) => expanded.some((kw) => t.includes(kw) || kw.includes(t))))
  );
  const general = STORES.filter((s) => s.tags.length === 0 && !fromPosts.includes(s));
  return [...new Set([...fromPosts, ...fromTags, ...general])].slice(0, 4);
}

// ────────────────────────────────────
// スコアリング
// ────────────────────────────────────
function scorePost(post: Post, relation: Relation | null, scene: Scene | null, price: PriceRange | null, query: string): number {
  let score = 0;
  if (relation && post.relation === relation) score += 3;
  if (scene && post.scene === scene) score += 3;
  if (price && post.price === price) score += 1;
  if (query) {
    const expanded = expandQuery(query);
    const text = postFullText(post);
    if (expanded.some((kw) => text.includes(kw))) score += 2;
  }
  return score;
}

// ────────────────────────────────────
// サブコンポーネント: カード（hook使用のため分離）
// ────────────────────────────────────
interface CardProps {
  post: Post;
  likes: Record<number, boolean>;
  onTapPost: (p: Post) => void;
}

function PrimaryCard({ post, likes, onTapPost }: CardProps) {
  const image = useOgpImage(post.url);
  return (
    <div
      onClick={() => onTapPost(post)}
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-accent)",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 20,
        boxShadow: "0 4px 20px rgba(232,80,42,0.1)",
        cursor: "pointer",
      }}
    >
      {image && (
        <div style={{ width: "100%", height: 180, overflow: "hidden", background: "var(--color-surface-alt)" }}>
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ marginBottom: 10 }}><PostTags post={post} /></div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.4, marginBottom: 14 }}>
          {post.item}
        </div>
        <div style={{
          background: "var(--color-surface-alt)",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 14,
          borderLeft: "3px solid var(--color-accent)",
        }}>
          <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, marginBottom: 5, letterSpacing: "0.05em" }}>
            なぜこれを選んだか
          </div>
          <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.75 }}>
            {post.reason}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--color-fg-subtle)", fontSize: 12 }}>
            <Icon name="heart" size={12} color="var(--color-fg-subtle)" />
            {post.likes + (likes[post.id] ? 1 : 0)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-accent)" }}>
            詳しく見る →
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryCard({ post, likes, onTapPost }: CardProps) {
  const image = useOgpImage(post.url);
  return (
    <div
      onClick={() => onTapPost(post)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 10,
        boxShadow: "var(--shadow-1)",
        cursor: "pointer",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {image ? (
        <div style={{ width: 80, flexShrink: 0, background: "var(--color-surface-alt)", overflow: "hidden" }}>
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{
          width: 80, flexShrink: 0,
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="gift" size={20} color="var(--color-fg-subtle)" />
        </div>
      )}
      <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
        <div style={{ marginBottom: 5 }}><PostTags post={post} small /></div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)", marginBottom: 4, lineHeight: 1.35 }}>{post.item}</div>
        <div style={{
          fontSize: 11, color: "var(--color-fg-muted)", lineHeight: 1.6,
          overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>{post.reason}</div>
      </div>
      <div style={{ flexShrink: 0, padding: "12px 12px 12px 0", display: "flex", alignItems: "center", gap: 3, color: "var(--color-fg-subtle)", fontSize: 11 }}>
        <Icon name="heart" size={11} color="var(--color-fg-subtle)" />
        {post.likes + (likes[post.id] ? 1 : 0)}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// Axisフェーズ用モノ軸カード（hookのため分離）
// ────────────────────────────────────
interface AxisItemCardProps {
  post: Post;
  highlighted: boolean;
  onTapPost: (p: Post) => void;
}

function AxisItemCard({ post, highlighted, onTapPost }: AxisItemCardProps) {
  const image = useOgpImage(post.url);
  return (
    <div
      onClick={() => onTapPost(post)}
      style={{
        background: "var(--color-surface)",
        border: highlighted ? "2px solid var(--color-accent)" : "1.5px solid var(--color-border)",
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: highlighted ? "0 4px 16px rgba(232,80,42,0.1)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 商品画像 */}
      {image ? (
        <div style={{ width: "100%", height: 160, overflow: "hidden", background: "var(--color-surface-alt)", flexShrink: 0 }}>
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{
          width: "100%", height: 80, flexShrink: 0,
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="gift" size={28} color="var(--color-fg-subtle)" />
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>
        {/* タグ */}
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          {[post.relation, post.scene].map((t) => (
            <span key={t} style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
              background: highlighted ? "rgba(232,80,42,0.08)" : "var(--color-surface-alt)",
              color: highlighted ? "var(--color-accent)" : "var(--color-fg-muted)",
            }}>{t}</span>
          ))}
        </div>
        {/* アイテム名（メイン） */}
        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 8 }}>
          {post.item}
        </div>
        {/* reason（サブ） */}
        <div style={{
          fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.7,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.reason}
        </div>
        {/* 価格 */}
        <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 8, fontWeight: 500 }}>
          {post.price}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────
interface SearchScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function SearchScreen({ likes, onTapPost }: SearchScreenProps) {
  const [phase, setPhase] = useState<"explore" | "vibe" | "axis" | "results">("explore");

  // explore phase
  const [filterRelation, setFilterRelation] = useState<Relation | null>(null);
  const [filterScene, setFilterScene] = useState<Scene | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // vibe phase
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [wishSentence, setWishSentence] = useState("");

  // results phase
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [price, setPrice] = useState<PriceRange | null>(null);
  const [query, setQuery] = useState("");

  const hasFilter = filterRelation !== null || filterScene !== null;

  const visibleEpisodes = useMemo(() => {
    if (!hasFilter) return [];
    const matched = FEED_DATA.filter((p) =>
      (!filterRelation || p.relation === filterRelation) &&
      (!filterScene || p.scene === filterScene)
    );
    const rest = FEED_DATA.filter((p) => !matched.includes(p));
    return [...matched, ...rest];
  }, [filterRelation, filterScene, hasFilter]);

  const selectedPosts = FEED_DATA.filter((p) => selectedIds.includes(p.id));

  const availableVibes = useMemo(() => {
    const all = selectedPosts.flatMap((p) => p.vibes ?? []);
    return [...new Set(all)];
  }, [selectedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const ranked = useMemo(() => {
    return [...FEED_DATA]
      .map((p) => ({ post: p, score: scorePost(p, relation, scene, price, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
  }, [relation, scene, price, query]);

  const primary = ranked[0]?.post ?? null;
  const secondaries = ranked.slice(1).map(({ post }) => post);
  const insight = getInsight(relation, scene);
  const stores = useMemo(() => getStores(ranked.map((r) => r.post), query), [ranked, query]);

  const toggleEpisode = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleVibe = (v: string) => {
    setSelectedVibes((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);
  };

  const buildWish = (vibes: string[], note: string): string => {
    const parts = vibes.length > 0 ? [vibes.join("、") + "ような贈り物がしたい。"] : [];
    if (note.trim()) parts.push(note.trim());
    return parts.join("\n");
  };

  const reset = () => {
    setPhase("explore");
    setFilterRelation(null);
    setFilterScene(null);
    setSelectedIds([]);
    setSelectedVibes([]);
    setMemo("");
    setWishSentence("");
    setRelation(null);
    setScene(null);
    setPrice(null);
    setQuery("");
  };

  const handleGoVibe = () => {
    setPhase("vibe");
  };

  const handleGoAxis = () => {
    const sentence = wishSentence.trim() || buildWish(selectedVibes, memo);
    setWishSentence(sentence);
    setPhase("axis");
  };

  const handleGoSearch = () => {
    const primary = selectedPosts[0];
    if (primary) {
      setRelation(primary.relation);
      setScene(primary.scene);
      setQuery(selectedVibes.join("、"));
    }
    setPhase("results");
  };

  // ── Exploreフェーズ ──────────────────
  if (phase === "explore") {
    return (
      <div style={{ padding: "28px 20px 100px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>プレゼントを一緒に考えよう</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", letterSpacing: "-0.5px", lineHeight: 1.3 }}>誰へのどんな<br />プレゼントですか？</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", marginBottom: 10 }}>誰に？</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map((r) => (
              <TagChip key={r} label={r} selected={filterRelation === r}
                onClick={() => { setFilterRelation(filterRelation === r ? null : r); setSelectedIds([]); setSelectedVibes([]); }} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", marginBottom: 10 }}>どんな場面で？</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCENES.map((s) => (
              <TagChip key={s} label={s} selected={filterScene === s}
                onClick={() => { setFilterScene(filterScene === s ? null : s); setSelectedIds([]); setSelectedVibes([]); }} />
            ))}
          </div>
        </div>

        {hasFilter && visibleEpisodes.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 14 }}>こんな選び方をした人がいます</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {visibleEpisodes.map((ep) => {
                const isSelected = selectedIds.includes(ep.id);
                return (
                  <div key={ep.id} style={{
                    background: "var(--color-surface)",
                    border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: 18, padding: 16,
                    boxShadow: isSelected ? "0 4px 16px rgba(232,80,42,0.1)" : "none",
                    transition: "all 200ms ease",
                  }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[ep.relation, ep.scene, ep.price].map((t) => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: isSelected ? "rgba(232,80,42,0.08)" : "var(--color-surface-alt)", color: isSelected ? "var(--color-accent)" : "var(--color-fg-muted)" }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.8, marginBottom: 10 }}>{ep.reason}</div>
                    <div style={{ fontSize: 11, color: "var(--color-fg-muted)", fontWeight: 500, marginBottom: 12 }}>{ep.item}</div>
                    <button
                      onClick={() => toggleEpisode(ep.id)}
                      style={{
                        width: "100%", padding: "10px 0", borderRadius: 100, border: "none",
                        background: isSelected ? "var(--color-accent)" : "var(--color-surface-alt)",
                        color: isSelected ? "#fff" : "var(--color-fg-muted)",
                        fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                        transition: "all 200ms ease",
                      }}
                    >{isSelected ? "✓ 素敵！！" : "これ素敵！！"}</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedIds.length > 0 && (
          <button
            onClick={handleGoVibe}
            style={{
              width: "100%", padding: 16, borderRadius: 100, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontSize: 16, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
            }}
          >{selectedIds.length}件選んだ　→　次へ</button>
        )}
      </div>
    );
  }

  // ── Vibeフェーズ ─────────────────────
  if (phase === "vibe") {
    const previewSentence = wishSentence.trim() || buildWish(selectedVibes, memo);
    const canProceed = selectedVibes.length > 0 || memo.trim().length > 0;
    return (
      <div style={{ padding: "28px 20px 100px" }}>

          <button
            onClick={() => setPhase("explore")}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 24 }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            エピソードに戻る
          </button>

          {/* 選んだエピソード（コンパクト表示） */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 10 }}>
            選んだエピソード
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {selectedPosts.map((sp) => (
              <div key={sp.id} style={{
                background: "var(--color-surface-alt)",
                borderLeft: "3px solid var(--color-accent)",
                borderRadius: "0 10px 10px 0",
                padding: "10px 14px",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg)", marginBottom: 3 }}>{sp.item}</div>
                <div style={{ fontSize: 11, color: "var(--color-fg-muted)", lineHeight: 1.6,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                } as React.CSSProperties}>{sp.reason}</div>
              </div>
            ))}
          </div>

          {/* vibeタグ */}
          {availableVibes.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", marginBottom: 6 }}>
                どこが素敵だと思った？
              </div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 14 }}>いくつでも</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {availableVibes.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      toggleVibe(v);
                      setWishSentence("");
                    }}
                    style={{
                      fontSize: 13, padding: "8px 16px", borderRadius: 100,
                      border: `1.5px solid ${selectedVibes.includes(v) ? "var(--color-accent)" : "var(--color-border)"}`,
                      background: selectedVibes.includes(v) ? "var(--color-accent)" : "var(--color-surface)",
                      color: selectedVibes.includes(v) ? "#fff" : "var(--color-fg)",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                      transition: "all 150ms ease",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 思い出すことメモ */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", marginBottom: 6 }}>
              その人へのエピソードで思い出すことは？
            </div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 12 }}>
              一緒にいた場面・その人らしいなと思ったこと、なんでも
            </div>
            <div style={{
              background: "var(--color-surface)",
              border: `1.5px solid ${memo ? "var(--color-accent)" : "var(--color-border)"}`,
              borderRadius: 14, padding: "12px 14px",
              transition: "border-color 150ms ease",
            }}>
              <textarea
                value={memo}
                onChange={(e) => { setMemo(e.target.value); setWishSentence(""); }}
                placeholder={"例：仕事が辛い時に香りで切り替えるって言ってた\n新居でふと思い出してほしい"}
                rows={3}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: "var(--color-fg)", width: "100%",
                  fontFamily: "inherit", resize: "none", lineHeight: 1.8,
                }}
              />
            </div>
          </div>

          {/* 1文プレビュー（vibeかmemoがあれば表示） */}
          {(selectedVibes.length > 0 || memo.trim()) && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>
                こんなふうに喜んでほしい！
              </div>
              <div style={{
                background: "linear-gradient(135deg, var(--color-accent-light) 0%, #fff8f5 100%)",
                border: "1.5px solid rgba(232,80,42,0.25)",
                borderRadius: 14, padding: "12px 14px",
              }}>
                <textarea
                  value={wishSentence || previewSentence}
                  onChange={(e) => setWishSentence(e.target.value)}
                  rows={3}
                  style={{
                    border: "none", outline: "none", background: "transparent",
                    fontSize: 14, fontWeight: 600, color: "var(--color-fg)", width: "100%",
                    fontFamily: "inherit", resize: "none", lineHeight: 1.8,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 6 }}>
                自由に書き直してOK
              </div>
            </div>
          )}

        <button
          onClick={handleGoAxis}
          disabled={!canProceed}
          style={{
            width: "100%", padding: 16, borderRadius: 100, border: "none",
            background: canProceed ? "var(--color-accent)" : "var(--color-surface-alt)",
            color: canProceed ? "#fff" : "var(--color-fg-subtle)",
            fontSize: 16, fontWeight: 700, fontFamily: "inherit",
            cursor: canProceed ? "pointer" : "not-allowed",
            boxShadow: canProceed ? "0 4px 20px rgba(232,80,42,0.35)" : "none",
            transition: "all 220ms ease-out",
          }}
        >
          こんな感じで選ぼう！
        </button>
      </div>
    );
  }

  // ── 軸フェーズ ────────────────────────
  if (phase === "axis" && selectedPosts.length > 0) {
    const primaryPost = selectedPosts[0];
    const similarPosts = FEED_DATA.filter(
      (p) => !selectedIds.includes(p.id) &&
        (p.relation === primaryPost.relation || p.scene === primaryPost.scene)
    );
    const displayWish = wishSentence.trim();

    return (
      <div style={{ padding: "28px 20px 120px" }}>

          <button
            onClick={() => setPhase("vibe")}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 24 }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            戻る
          </button>

          {/* 贈りたい想いカード */}
          {displayWish && (
            <div style={{
              background: "linear-gradient(135deg, var(--color-accent-light) 0%, #fff8f5 100%)",
              border: "1.5px solid rgba(232,80,42,0.25)",
              borderRadius: 20, padding: "20px 20px 16px", marginBottom: 28,
            }}>
              <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
                こんなふうに喜んでほしい！
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {displayWish}
              </div>
              {selectedVibes.length > 0 && (
                <>
                  <div style={{ height: 1, background: "rgba(232,80,42,0.15)", margin: "14px 0 10px" }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedVibes.map((v) => (
                      <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(232,80,42,0.08)", color: "var(--color-accent)", fontWeight: 600 }}>{v}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 選んだエピソード → モノ軸 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 12 }}>
            素敵と思ったプレゼント
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {selectedPosts.map((sp) => (
              <AxisItemCard key={sp.id} post={sp} highlighted onTapPost={onTapPost} />
            ))}
          </div>

          {/* 似たエピソード */}
          {similarPosts.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 12 }}>
                似た軸のプレゼントも見てみよう
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {similarPosts.map((p) => (
                  <AxisItemCard key={p.id} post={p} highlighted={false} onTapPost={onTapPost} />
                ))}
              </div>
            </>
          )}
      </div>
    );
  }

  // ── 結果フェーズ ──────────────────────
  if (phase === "results") {
    return (
      <div style={{ padding: "20px 20px 100px" }}>
        {/* 戻るヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={reset}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--color-fg-muted)", fontFamily: "inherit", padding: 0,
            }}
          >
            <Icon name="arrow-left" size={15} color="var(--color-fg-muted)" />
            条件を変える
          </button>
          <div style={{ display: "flex", gap: 5 }}>
            {relation && <span style={{ fontSize: 11, background: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: 100, padding: "3px 9px", fontWeight: 600 }}>{relation}</span>}
            {scene && <span style={{ fontSize: 11, background: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: 100, padding: "3px 9px", fontWeight: 600 }}>{scene}</span>}
          </div>
        </div>

        {/* インサイトブロック */}
        {insight && (
          <div style={{
            background: "linear-gradient(135deg, var(--color-accent-light) 0%, #fff8f5 100%)",
            border: "1px solid rgba(232,80,42,0.15)",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>
              こんなプレゼントがしたい
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.5, marginBottom: 12 }}>
              {insight.credo}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-fg-muted)", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 8 }}>
              あるいはこんなイメージ？
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {insight.tip.map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  style={{
                    fontSize: 12, background: query === t ? "var(--color-accent)" : "#fff",
                    border: `1px solid ${query === t ? "var(--color-accent)" : "rgba(232,80,42,0.25)"}`,
                    borderRadius: 100, padding: "5px 12px",
                    color: query === t ? "#fff" : "var(--color-fg)",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                    transition: "all 150ms ease",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {ranked.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-fg-subtle)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎁</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 8 }}>
              まだ近い投稿がありません
            </div>
            <div style={{ fontSize: 13 }}>条件を変えるか、あなたが最初の投稿者になろう</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.04em" }}>
              おすすめのプレゼント
            </div>
            <PrimaryCard post={primary!} likes={likes} onTapPost={onTapPost} />

            {secondaries.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.04em" }}>
                  他にも似たプレゼント
                </div>
                {secondaries.map((p) => (
                  <SecondaryCard key={p.id} post={p} likes={likes} onTapPost={onTapPost} />
                ))}
              </>
            )}
          </>
        )}

        {/* おすすめ店舗 */}
        {stores.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.04em" }}>
              こんなお店でも探してみよう
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stores.map((store) => (
                <a
                  key={store.name}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    textDecoration: "none",
                    boxShadow: "var(--shadow-1)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)", marginBottom: 2 }}>{store.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>{store.desc}</div>
                  </div>
                  <Icon name="external-link" size={14} color="var(--color-fg-subtle)" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
