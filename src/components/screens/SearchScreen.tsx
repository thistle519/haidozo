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
  "友達_誕生日":        { credo: "相手の「好き」に寄り添うと、一番喜ばれる", tip: ["日常使いできるもの", "その人の趣味に関係するもの"] },
  "友達_なんでもない日": { credo: "「なんでもない日」に贈るプレゼントは、それだけで特別になる", tip: ["高価すぎないけど、ちゃんと選んだとわかるもの", "一緒に体験できるもの"] },
  "友達_送別":          { credo: "新生活を応援する気持ちが伝わるものがぴったり", tip: ["新居で使えるもの", "引越し後も思い出になるもの"] },
  "友達_手土産":        { credo: "手土産は「その場が楽しくなる」ものが正解", tip: ["一緒に食べられるもの", "見た目が可愛いもの"] },
  "友達_お礼":          { credo: "「ありがとう」が伝わる、素直なプレゼントが響く", tip: ["相手が好きなジャンルのもの", "普段自分では買わないちょっといいもの"] },
  "先生・恩師_お礼":    { credo: "長年のお礼は「あなただから選んだ」という気持ちが一番伝わる", tip: ["相手の趣味や仕事にまつわるもの", "長く使えるもの"] },
  "先生・恩師_誕生日":  { credo: "敬意とあたたかさを両立したプレゼントが喜ばれる", tip: ["品があって実用的なもの", "季節感のあるもの"] },
  "先生・恩師_送別":    { credo: "「お世話になりました」の気持ちを形にするなら、記憶に残るものを", tip: ["贈り手の気持ちが伝わるもの", "一緒に消費できるもの"] },
  "恋人_誕生日":        { credo: "サプライズより「ちゃんと見てる」が伝わるものが刺さる", tip: ["相手が好きなブランド・ジャンル", "一緒に使えるもの"] },
  "家族_誕生日":        { credo: "家族だからこそ、改めて「ありがとう」が伝わるものを", tip: ["日常使いで喜ばれるもの", "少し特別感のあるもの"] },
};

function getInsight(relation: Relation | null, scene: Scene | null): Insight | null {
  if (!relation || !scene) return null;
  const key = `${relation}_${scene}`;
  return INSIGHT[key] ?? { credo: "その人のことを思って選んだ、というのが一番のプレゼント", tip: ["相手の趣味に関係するもの", "日常使いできるもの"] };
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
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [price, setPrice] = useState<PriceRange | null>(null);
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"select" | "results">("select");

  const canSearch = relation !== null || scene !== null || query.trim() !== "";

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
    setRelation(null);
    setScene(null);
    setPrice(null);
    setQuery("");
    setPhase("select");
  };

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
              こんなこだわりがありそう
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.55, marginBottom: 12 }}>
              「{insight.credo}」
            </div>
            <div style={{ fontSize: 10, color: "var(--color-fg-muted)", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6 }}>
              ここから探してみるといいかも
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {insight.tip.map((t) => (
                <span key={t} style={{
                  fontSize: 12, background: "#fff", border: "1px solid rgba(232,80,42,0.2)",
                  borderRadius: 100, padding: "4px 10px", color: "var(--color-fg)",
                }}>
                  {t}
                </span>
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

  // ── 選択フェーズ ──────────────────────
  return (
    <div style={{ padding: "28px 20px 100px" }}>
      {/* タイトル */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", letterSpacing: "-0.5px", lineHeight: 1.3, marginBottom: 6 }}>
          一緒にプレゼントを探そう
        </div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
          贈る相手のことを教えてもらえると、より近い提案ができます
        </div>
      </div>

      {/* ★ どんな人？ — メインフィールド */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>
          どんな人？
        </div>
        <div style={{
          background: "var(--color-surface)",
          border: `1.5px solid ${query ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: 16, padding: "14px 16px",
          transition: "border-color 150ms ease",
        }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={"例：香水が好き\nマルジェラが好きそう、おしゃれな人\nコーヒーのプロだから違うものを贈りたい"}
            rows={3}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: "var(--color-fg)", width: "100%",
              fontFamily: "inherit", resize: "none", lineHeight: 1.7,
            }}
          />
          {query && (
            <div style={{ textAlign: "right" }}>
              <span
                onClick={() => setQuery("")}
                style={{ fontSize: 11, color: "var(--color-fg-subtle)", cursor: "pointer" }}
              >
                クリア
              </span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 6, lineHeight: 1.6 }}>
          「、」や改行で複数入力できます
        </div>
      </div>

      {/* 区切り */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        <span style={{ fontSize: 11, color: "var(--color-fg-subtle)", whiteSpace: "nowrap" }}>さらに絞り込む</span>
        <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>誰に贈りたい？</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RELATIONS.map((r) => (
            <TagChip key={r} label={r} selected={relation === r} onClick={() => setRelation(relation === r ? null : r)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>どんな時に？</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SCENES.map((s) => (
            <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 4 }}>
          予算は？
          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 6 }}>任意</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {PRICES.map((p) => (
            <TagChip key={p} label={p} selected={price === p} onClick={() => setPrice(price === p ? null : p)} />
          ))}
        </div>
      </div>

      <button
        onClick={() => setPhase("results")}
        disabled={!canSearch}
        style={{
          width: "100%", padding: "16px", borderRadius: 100,
          background: canSearch ? "var(--color-accent)" : "var(--color-border)",
          border: "none", cursor: canSearch ? "pointer" : "not-allowed",
          fontSize: 16, fontWeight: 700,
          color: canSearch ? "#fff" : "var(--color-fg-subtle)",
          fontFamily: "inherit",
          transition: "all 200ms ease",
          boxShadow: canSearch ? "0 4px 16px rgba(232,80,42,0.35)" : "none",
        }}
      >
        提案を見る
      </button>
    </div>
  );
}
