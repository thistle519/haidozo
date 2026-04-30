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
// メインコンポーネント
// ────────────────────────────────────
interface SearchScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function SearchScreen({ likes, onTapPost }: SearchScreenProps) {
  const [phase, setPhase] = useState<"browse" | "annotate" | "axis" | "results">("browse");

  // browse phase
  const [filterRelation, setFilterRelation] = useState<Relation | null>(null);
  const [episodeIndex, setEpisodeIndex] = useState(0);

  // annotate / axis
  const [resonatedId, setResonatedId] = useState<number | null>(null);
  const [myContext, setMyContext] = useState("");

  // results phase
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [price, setPrice] = useState<PriceRange | null>(null);
  const [query, setQuery] = useState("");

  const orderedEpisodes = useMemo(() => {
    if (!filterRelation) return FEED_DATA;
    return [
      ...FEED_DATA.filter((p) => p.relation === filterRelation),
      ...FEED_DATA.filter((p) => p.relation !== filterRelation),
    ];
  }, [filterRelation]);

  const currentEpisode = orderedEpisodes[episodeIndex] ?? FEED_DATA[0];
  const resonatedPost = FEED_DATA.find((p) => p.id === resonatedId) ?? null;

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

  const reset = () => {
    setPhase("browse");
    setEpisodeIndex(0);
    setResonatedId(null);
    setMyContext("");
    setRelation(null);
    setScene(null);
    setPrice(null);
    setQuery("");
  };

  const handleYes = () => {
    setResonatedId(currentEpisode.id);
    setPhase("annotate");
  };

  const handleNo = () => {
    setEpisodeIndex((i) => (i + 1) % orderedEpisodes.length);
  };

  const handleAnnotateSubmit = () => {
    setPhase("axis");
  };

  const handleGoSearch = () => {
    if (resonatedPost) {
      setRelation(resonatedPost.relation);
      setScene(resonatedPost.scene);
      setQuery(myContext);
    }
    setPhase("results");
  };

  // ── ブラウズフェーズ ──────────────────
  if (phase === "browse") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 120px" }}>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", letterSpacing: "-0.5px", lineHeight: 1.3, marginBottom: 6 }}>
              一緒にプレゼントを探そう
            </div>
            <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
              気になるエピソードを選んで、方向性を見つけよう
            </div>
          </div>

          {/* 関係性フィルター */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
            {RELATIONS.map((r) => (
              <TagChip
                key={r} label={r}
                selected={filterRelation === r}
                onClick={() => { setFilterRelation(filterRelation === r ? null : r); setEpisodeIndex(0); }}
              />
            ))}
          </div>

          {/* エピソードカード */}
          <div style={{
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 20, padding: 20, marginBottom: 16,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[currentEpisode.relation, currentEpisode.scene, currentEpisode.price].map((tag) => (
                <span key={tag} style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                  background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
                }}>{tag}</span>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>
                贈った相手のこと
              </div>
              <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>
                {currentEpisode.about}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--color-border)", margin: "14px 0" }} />

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>
                なぜこれを選んだか
              </div>
              <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>
                {currentEpisode.reason}
              </div>
            </div>

            <div style={{
              marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--color-border)",
              fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 500,
            }}>
              {currentEpisode.item}
            </div>
          </div>

          {/* プログレス */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            {orderedEpisodes.map((_, i) => (
              <div key={i} style={{
                width: i === episodeIndex ? 18 : 6, height: 6, borderRadius: 100,
                background: i === episodeIndex ? "var(--color-accent)" : "var(--color-border)",
                transition: "all 300ms ease", cursor: "pointer",
              }} onClick={() => setEpisodeIndex(i)} />
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--color-fg-subtle)", marginBottom: 0 }}>
            {episodeIndex + 1} / {orderedEpisodes.length}
          </div>
        </div>

        <div style={{
          flexShrink: 0, padding: "12px 20px 20px",
          background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <button
            onClick={handleYes}
            style={{
              width: "100%", padding: 16, borderRadius: 100, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontSize: 16, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
              transition: "all 220ms ease-out",
            }}
          >
            これに近い！
          </button>
          <button
            onClick={handleNo}
            style={{
              width: "100%", padding: 14, borderRadius: 100,
              border: "1.5px solid var(--color-border)", background: "transparent",
              color: "var(--color-fg-muted)", fontSize: 15, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer",
              transition: "all 220ms ease-out",
            }}
          >
            ちょっと違うかも →
          </button>
        </div>
      </div>
    );
  }

  // ── アノテートフェーズ ────────────────
  if (phase === "annotate") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 100px" }}>

          <button
            onClick={() => setPhase("browse")}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 28,
            }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            戻る
          </button>

          {/* 選んだエピソード（小さく） */}
          {resonatedPost && (
            <div style={{
              background: "var(--color-surface-alt)",
              borderRadius: 14, padding: "12px 14px",
              marginBottom: 28,
              borderLeft: "3px solid var(--color-accent)",
            }}>
              <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 4 }}>
                選んだエピソード
              </div>
              <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.7 }}>
                {resonatedPost.reason}
              </div>
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>
            もう少し教えて
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 8 }}>
            贈る相手のこと、<br />どんな人ですか？
          </div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            何が好きか、どんな人柄か、最近あったこと…<br />思い浮かんだことをそのまま書いてみてください。
          </div>

          <div style={{
            background: "var(--color-surface)",
            border: `1.5px solid ${myContext ? "var(--color-accent)" : "var(--color-border)"}`,
            borderRadius: 16, padding: "14px 16px",
            transition: "border-color 150ms ease",
          }}>
            <textarea
              value={myContext}
              onChange={(e) => setMyContext(e.target.value)}
              placeholder={"例：紅茶が好きで、先日引越しした\nいつも頑張ってて、ゆっくりできてなさそう\nコーヒー屋さんで働いてる"}
              rows={4}
              autoFocus
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 14, color: "var(--color-fg)", width: "100%",
                fontFamily: "inherit", resize: "none", lineHeight: 1.8,
              }}
            />
          </div>
        </div>

        <div style={{
          flexShrink: 0, padding: "12px 20px 20px",
          background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <button
            onClick={handleAnnotateSubmit}
            style={{
              width: "100%", padding: 16, borderRadius: 100, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontSize: 16, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
              transition: "all 220ms ease-out",
            }}
          >
            軸を見つける
          </button>
          <button
            onClick={handleAnnotateSubmit}
            style={{
              width: "100%", padding: 14, borderRadius: 100,
              border: "none", background: "transparent",
              color: "var(--color-fg-subtle)", fontSize: 13, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            スキップして探す
          </button>
        </div>
      </div>
    );
  }

  // ── 軸フェーズ ────────────────────────
  if (phase === "axis" && resonatedPost) {
    const axisInsight = getInsight(resonatedPost.relation, resonatedPost.scene);
    const axisCredo = axisInsight?.credo ?? "その人を想って選んだ、というのが伝わるもの";

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 20px 120px" }}>

          <div style={{
            width: 56, height: 56, borderRadius: 100,
            background: "var(--color-sage-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <Icon name="check" size={26} color="#8B6F00" />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>
            軸が見えてきた
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.3, marginBottom: 28 }}>
            じゃあこういう<br />軸ね！
          </div>

          <div style={{
            background: "linear-gradient(135deg, var(--color-accent-light) 0%, #fff8f5 100%)",
            border: "1.5px solid rgba(232,80,42,0.2)",
            borderRadius: 20, padding: 20, marginBottom: 16,
          }}>
            <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>
              こんなプレゼントがしたい
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.55, marginBottom: myContext ? 16 : 0 }}>
              {axisCredo}
            </div>

            {myContext && (
              <>
                <div style={{ height: 1, background: "rgba(232,80,42,0.15)", margin: "0 0 14px" }} />
                <div style={{ fontSize: 10, color: "var(--color-fg-muted)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>
                  このひとのこと
                </div>
                <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.8 }}>
                  {myContext}
                </div>
              </>
            )}
          </div>

          <div style={{ fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
            {resonatedPost.relation}への{resonatedPost.scene}のプレゼントを探します
          </div>
        </div>

        <div style={{
          flexShrink: 0, padding: "12px 20px 20px",
          background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <button
            onClick={handleGoSearch}
            style={{
              width: "100%", padding: 16, borderRadius: 100, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontSize: 16, fontWeight: 700, fontFamily: "inherit",
              cursor: "pointer", boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
              transition: "all 220ms ease-out",
            }}
          >
            この方向で探す
          </button>
          <button
            onClick={() => { setPhase("browse"); setEpisodeIndex(0); setResonatedId(null); setMyContext(""); }}
            style={{
              width: "100%", padding: 14, borderRadius: 100,
              border: "1.5px solid var(--color-border)", background: "transparent",
              color: "var(--color-fg-muted)", fontSize: 15, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            もっと見てみる
          </button>
        </div>
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
