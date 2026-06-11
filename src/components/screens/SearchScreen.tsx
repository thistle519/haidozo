"use client";

import { useState, useMemo } from "react";
import type { Post, Plan, Relation, PriceRange, Scene } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import { expandQuery, postFullText } from "@/lib/searchUtils";
import { useOgpImage } from "@/lib/useOgpImage";
import PostTags from "@/components/ui/PostTags";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

// ────────────────────────────────────
// おもいめぐり — 統合された唯一の「みつける」動線
// home（考え中の相手）→ start（前提条件）→ meguru（3つの問い×反応するヒント）→ result（想いの一文→モノ）
//
// めぐらせるUXの設計（MEGURU_UX.md）:
//   関係性・場面 = 選択式（前提条件は速く済ませる）
//   好きなもの   = 自由回答（書く=考える）
//   エピソード   = 自由記述＋思い出すきっかけの補助プロンプト
//   他人の投稿   = 入力に反応して浮かぶ「相槌」
//   喜んでほしい = みんなの想いのかけらから共鳴＋自由追加
// ────────────────────────────────────

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "先生・恩師", "同僚", "上司"];
const SCENES: Scene[] = ["誕生日", "記念日", "お礼", "送別", "手土産", "なんでもない日", "応援", "結婚祝い"];

// Step2 思い出すきっかけ
const MEMORY_PROMPTS = [
  "最後に会ったとき、何の話をした？",
  "その人のSNS、最近どんな投稿だった？",
  "前にあげたもの・もらったものは？",
  "「その人らしいな」と思った瞬間は？",
];

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
// サブコンポーネント: 結果カード
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
type Phase = "home" | "start" | "meguru" | "result";

interface SearchScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
  plans: Plan[];
  onSavePlan: (plan: Plan) => void;
  onCompose: () => void;
}

export default function SearchScreen({ likes, onTapPost, plans, onSavePlan, onCompose }: SearchScreenProps) {
  const [phase, setPhase] = useState<Phase>("home");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 作業中のプラン状態
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [loves, setLoves] = useState<string[]>([]);
  const [loveInput, setLoveInput] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeInput, setVibeInput] = useState("");
  const [wish, setWish] = useState("");

  const resetWork = () => {
    setEditingPlanId(null);
    setLabel("");
    setRelation(null);
    setScene(null);
    setLoves([]);
    setLoveInput("");
    setMemo("");
    setSelectedIds([]);
    setSelectedVibes([]);
    setVibeInput("");
    setWish("");
    setStep(1);
  };

  const startNew = () => {
    resetWork();
    setPhase("start");
  };

  const resumePlan = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setLabel(plan.label);
    setRelation(plan.relation);
    setScene(plan.scene);
    setLoves(plan.loves ?? []);
    setMemo(plan.memo);
    setSelectedIds(plan.selectedIds);
    setSelectedVibes(plan.vibes);
    setWish(plan.wish);
    setStep(1);
    setPhase(plan.wish ? "result" : "meguru");
  };

  const buildWish = (vibes: string[], note: string, lv: string[]): string => {
    if (vibes.length > 0 || note.trim()) {
      const parts = vibes.length > 0 ? [vibes.join("、") + "。"] : [];
      if (note.trim()) parts.push(note.trim());
      return parts.join("\n");
    }
    if (lv.length > 0) return `${lv.join("、")}が好きなあの人に、ちゃんと考えて選んだものを。`;
    return "";
  };

  // ── 好きなもの（自由回答チップ）──
  const addLove = () => {
    const v = loveInput.trim();
    if (!v || loves.includes(v)) { setLoveInput(""); return; }
    setLoves((prev) => [...prev, v]);
    setLoveInput("");
  };
  const removeLove = (v: string) => setLoves((prev) => prev.filter((x) => x !== v));

  // ── エピソード共鳴 ──
  const toggleEpisode = (post: Post) => {
    setSelectedIds((prev) =>
      prev.includes(post.id) ? prev.filter((x) => x !== post.id) : [...prev, post.id]
    );
  };

  // ── 想いのかけら ──
  const toggleVibe = (v: string) =>
    setSelectedVibes((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]);

  const addVibe = () => {
    const v = vibeInput.trim();
    if (!v || selectedVibes.includes(v)) { setVibeInput(""); return; }
    setSelectedVibes((prev) => [...prev, v]);
    setVibeInput("");
  };

  // ── 入力に反応するヒント（他人の投稿が相槌を打つ）──
  const relatedPosts = useMemo(() => {
    const queries = [...loves, memo].map((s) => s.trim()).filter(Boolean);
    return [...FEED_DATA]
      .map((p) => {
        let s = 0;
        if (relation && p.relation === relation) s += 2;
        if (scene && p.scene === scene) s += 1;
        const text = postFullText(p);
        for (const q of queries) {
          const expanded = expandQuery(q);
          if (expanded.some((kw) => text.includes(kw))) s += 3;
        }
        return { post: p, score: s };
      })
      .sort((a, b) => b.score - a.score);
  }, [relation, scene, loves, memo]);

  // テキスト入力に実際にマッチしたものだけ「相槌」として出す
  const echoPosts = useMemo(
    () => relatedPosts.filter(({ score }) => score >= 3).map(({ post }) => post),
    [relatedPosts]
  );

  // Step3 かけら候補：共鳴したエピソード＋ヒント上位のvibes
  const vibeCandidates = useMemo(() => {
    const fromSelected = FEED_DATA.filter((p) => selectedIds.includes(p.id)).flatMap((p) => p.vibes ?? []);
    const fromRelated = relatedPosts.slice(0, 5).flatMap(({ post }) => post.vibes ?? []);
    return [...new Set([...fromSelected, ...fromRelated])].slice(0, 12);
  }, [selectedIds, relatedPosts]);

  // ── 結果 ──
  const query = useMemo(
    () => [...selectedVibes, ...loves, memo].filter(Boolean).join("、"),
    [selectedVibes, loves, memo]
  );

  const ranked = useMemo(() => {
    return [...FEED_DATA]
      .map((p) => ({ post: p, score: scorePost(p, relation, scene, null, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
  }, [relation, scene, query]);

  const primary = ranked[0]?.post ?? null;
  const secondaries = ranked.slice(1, 5).map(({ post }) => post);
  const insight = getInsight(relation, scene);
  const stores = useMemo(() => getStores(ranked.map((r) => r.post), query), [ranked, query]);

  const canFinish = selectedVibes.length > 0 || memo.trim().length > 0 || loves.length > 0;

  const handleGoResult = () => {
    if (!wish.trim()) setWish(buildWish(selectedVibes, memo, loves));
    setPhase("result");
  };

  const handleSave = () => {
    if (!relation) return;
    onSavePlan({
      id: editingPlanId ?? Date.now(),
      label: label.trim(),
      relation,
      scene,
      persona: [],
      loves,
      selectedIds,
      vibes: selectedVibes,
      memo,
      wish,
      savedAt: "たった今",
    });
    setPhase("home");
  };

  // ── 共通パーツ ──
  const contextChips = (
    <div style={{ display: "flex", gap: 5 }}>
      {[label || relation, scene].filter(Boolean).map((t) => (
        <span key={t as string} style={{ fontSize: 11, background: "var(--color-accent-light)", color: "var(--color-accent)", borderRadius: 100, padding: "3px 10px", fontWeight: 600 }}>{t}</span>
      ))}
    </div>
  );

  const headerRow = (onBack: () => void, backText: string) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <button
        onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-fg-muted)", padding: 0, fontFamily: "inherit" }}
      >
        <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
        {backText}
      </button>
      {contextChips}
    </div>
  );

  // 相槌ヒントカード（入力に反応して浮かぶ他人の投稿）
  const hintCard = (p: Post) => {
    const isSelected = selectedIds.includes(p.id);
    return (
      <div key={p.id} style={{
        background: "var(--color-surface)",
        border: `1.5px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: 18, padding: 14,
        boxShadow: isSelected ? "0 4px 16px rgba(232,80,42,0.1)" : "var(--shadow-1)",
        transition: "all 200ms ease",
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[p.relation, p.scene].map((t) => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: isSelected ? "rgba(232,80,42,0.08)" : "var(--color-surface-alt)", color: isSelected ? "var(--color-accent)" : "var(--color-fg-muted)" }}>{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.8, marginBottom: 8 }}>“{p.reason}”</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div
            onClick={() => onTapPost(p)}
            style={{ fontSize: 11, color: "var(--color-fg-muted)", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "var(--color-border)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {p.item}
          </div>
          <button
            onClick={() => toggleEpisode(p)}
            style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 100, border: "none",
              background: isSelected ? "var(--color-accent)" : "var(--color-surface-alt)",
              color: isSelected ? "#fff" : "var(--color-fg-muted)",
              fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            {isSelected ? "✓ いいかも" : "この感じ、いいかも"}
          </button>
        </div>
      </div>
    );
  };

  // その人ノート（貯まっていくのが見えるボード）
  const noteBoard = () => {
    const hasContent = loves.length > 0 || memo.trim() || selectedVibes.length > 0;
    if (!hasContent) return null;
    return (
      <div style={{
        background: "var(--color-surface-alt)", borderRadius: 18,
        padding: "14px 16px", marginTop: 24,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.06em", marginBottom: 10 }}>
          {(label || relation || "その人")}のノート
        </div>
        {loves.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: memo.trim() || selectedVibes.length > 0 ? 8 : 0 }}>
            {loves.map((v) => (
              <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-fg)", fontWeight: 600 }}>♡ {v}</span>
            ))}
          </div>
        )}
        {memo.trim() && (
          <div style={{
            fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.7,
            marginBottom: selectedVibes.length > 0 ? 8 : 0,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          } as React.CSSProperties}>
            「{memo.trim()}」
          </div>
        )}
        {selectedVibes.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {selectedVibes.map((v) => (
              <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(232,80,42,0.08)", color: "var(--color-accent)", fontWeight: 600 }}>{v}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── home：いま、誰のことを考えていますか？ ──────────
  if (phase === "home") {
    const teasers = FEED_DATA.filter((p) => p.vibes && p.vibes.length > 0).slice(0, 4);
    return (
      <div style={{ padding: "24px 20px 110px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>おもいめぐり</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 6 }}>
          いま、誰のことを<br />考えていますか？
        </div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 22 }}>
          思いめぐらせた時間が、いちばんの贈り物になる
        </div>

        {/* 唯一の入口 */}
        <div
          onClick={startNew}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "16px 18px", borderRadius: 18, marginBottom: 26,
            border: "1.5px dashed var(--color-accent)",
            background: "var(--color-accent-light)", cursor: "pointer",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 100, flexShrink: 0,
            background: "var(--color-accent)", boxShadow: "0 4px 14px rgba(232,80,42,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="plus" size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)" }}>新しく思いめぐらせる</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2 }}>誰かの顔が浮かんだら、ここから</div>
          </div>
        </div>

        {/* 考え中の相手 */}
        {plans.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 12 }}>
              考え中の相手（{plans.length}）
            </div>
            {plans.map((plan) => (
              <div key={plan.id} style={{
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "var(--shadow-1)",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 100, flexShrink: 0,
                    background: "var(--color-accent-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, fontWeight: 800, color: "var(--color-accent)",
                  }}>
                    {(plan.label || plan.relation).slice(0, 1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)", marginBottom: 4 }}>
                      {plan.label || plan.relation}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {[plan.relation, ...(plan.scene ? [plan.scene] : []), ...(plan.loves ?? []).slice(0, 2)].map((t) => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "var(--color-surface-alt)", color: "var(--color-fg-muted)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {(plan.wish || plan.memo) && (
                  <div style={{
                    fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 12,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  } as React.CSSProperties}>
                    「{plan.wish || plan.memo}」
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => resumePlan(plan)}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 100, border: "none",
                      background: "var(--color-accent)", color: "#fff",
                      fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    つづきを考える
                  </button>
                  <button
                    onClick={onCompose}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 100,
                      border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
                      fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)",
                      fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    贈った！記録する
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* フィードはヒント供給源として下部に */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "26px 0 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em" }}>
            みんなの「なぜ選んだか」
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", margin: "0 -20px", padding: "0 20px 4px" }}>
          {teasers.map((p) => (
            <div
              key={p.id}
              onClick={() => onTapPost(p)}
              style={{
                flexShrink: 0, width: 210,
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                borderRadius: 16, padding: "12px 14px", cursor: "pointer", boxShadow: "var(--shadow-1)",
              }}
            >
              <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                {[p.relation, p.scene].map((t) => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "var(--color-surface-alt)", color: "var(--color-fg-muted)" }}>{t}</span>
                ))}
              </div>
              <div style={{
                fontSize: 12, color: "var(--color-fg)", lineHeight: 1.7,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              } as React.CSSProperties}>
                “{p.reason}”
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── start：前提条件は速く済ませる ────────────────────
  if (phase === "start") {
    return (
      <div style={{ padding: "24px 20px 110px" }}>
        {headerRow(() => setPhase("home"), "もどる")}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>思いめぐらせる</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 6 }}>
          誰のことを考える？
        </div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 26 }}>
          ここはサクッと。考えるのはこの次から
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>
            関係性<span style={{ color: "var(--color-accent)", marginLeft: 2 }}>*</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map((r) => (
              <TagChip key={r} label={r} selected={relation === r} onClick={() => setRelation(relation === r ? null : r)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>
            どんな状況？<span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 6 }}>任意</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCENES.map((s) => (
              <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 10 }}>
            呼び名<span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 6 }}>任意・自分用のメモ</span>
          </div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="例：お母さん、ユウタ"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 14,
              border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
              fontSize: 14, color: "var(--color-fg)", fontFamily: "inherit", outline: "none",
            }}
          />
        </div>

        <button
          onClick={() => { if (relation) { setStep(1); setPhase("meguru"); } }}
          disabled={!relation}
          style={{
            width: "100%", padding: 16, borderRadius: 100, border: "none",
            background: relation ? "var(--color-accent)" : "var(--color-surface-alt)",
            color: relation ? "#fff" : "var(--color-fg-subtle)",
            fontSize: 16, fontWeight: 700, fontFamily: "inherit",
            cursor: relation ? "pointer" : "not-allowed",
            boxShadow: relation ? "0 4px 20px rgba(232,80,42,0.35)" : "none",
            transition: "all 220ms ease-out",
          }}
        >
          この人のことを考えはじめる
        </button>
      </div>
    );
  }

  // ── meguru：3つの問い × 反応するヒント ────────────────
  if (phase === "meguru") {
    const stepMeta = {
      1: { title: "その人、何が好き？", sub: "最近ハマってるもの、よく話してたこと。思いつくだけ" },
      2: { title: "ふと思い出すエピソードは？", sub: "一緒にいた場面、最近の会話、その人らしい瞬間" },
      3: { title: "どんなふうに喜んでほしい？", sub: "みんなの想いから、しっくりくるものを。自分の言葉でもOK" },
    }[step];

    return (
      <div style={{ padding: "24px 20px 110px" }}>
        {headerRow(() => (step === 1 ? setPhase("start") : setStep((step - 1) as 1 | 2 | 3)), step === 1 ? "条件を変える" : "前の問いへ")}

        {/* ステップインジケーター */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em" }}>めぐらせる</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                background: i <= step ? "var(--color-accent)" : "var(--color-border)",
                transition: "all 250ms ease",
              }} />
            ))}
          </div>
        </div>

        {/* 問いカード */}
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderLeft: "3px solid var(--color-accent)",
          borderRadius: "0 18px 18px 0",
          padding: "16px 18px", marginBottom: 18, boxShadow: "var(--shadow-1)",
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.5, marginBottom: 4 }}>
            {stepMeta.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 14 }}>
            {stepMeta.sub}
          </div>

          {/* Step1：好きなもの＝自由回答チップ */}
          {step === 1 && (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={loveInput}
                  onChange={(e) => setLoveInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLove(); } }}
                  placeholder="例：コーヒー、銭湯、推し活"
                  style={{
                    flex: 1, padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--color-border)", background: "var(--color-bg)",
                    fontSize: 14, color: "var(--color-fg)", fontFamily: "inherit", outline: "none",
                  }}
                />
                <button
                  onClick={addLove}
                  style={{
                    flexShrink: 0, padding: "0 18px", borderRadius: 12, border: "none",
                    background: loveInput.trim() ? "var(--color-accent)" : "var(--color-surface-alt)",
                    color: loveInput.trim() ? "#fff" : "var(--color-fg-subtle)",
                    fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  追加
                </button>
              </div>
              {loves.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {loves.map((v) => (
                    <button
                      key={v}
                      onClick={() => removeLove(v)}
                      style={{
                        fontSize: 13, padding: "7px 14px", borderRadius: 100,
                        border: "1.5px solid var(--color-accent)",
                        background: "var(--color-accent-light)", color: "var(--color-accent)",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                      }}
                    >
                      ♡ {v} ×
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step2：エピソード＝自由記述＋きっかけプロンプト */}
          {step === 2 && (
            <>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder={"例：仕事が辛い時に香りで切り替えるって言ってた\n書いているうちに、贈りたいものの輪郭が見えてくる"}
                rows={4}
                style={{
                  width: "100%", border: "1.5px solid var(--color-border)", borderRadius: 12,
                  background: "var(--color-bg)", outline: "none", padding: "10px 12px",
                  fontSize: 13, color: "var(--color-fg)", fontFamily: "inherit",
                  resize: "none", lineHeight: 1.8,
                }}
              />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>
                  思い出すきっかけ
                </div>
                {MEMORY_PROMPTS.map((q) => (
                  <div key={q} style={{ fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 2 }}>・{q}</div>
                ))}
              </div>
            </>
          )}

          {/* Step3：かけら＝共鳴＋自由追加 */}
          {step === 3 && (
            <>
              {vibeCandidates.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {vibeCandidates.map((v) => (
                    <button
                      key={v}
                      onClick={() => toggleVibe(v)}
                      style={{
                        fontSize: 12, padding: "7px 14px", borderRadius: 100,
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
              )}
              {/* 自由追加 */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={vibeInput}
                  onChange={(e) => setVibeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVibe(); } }}
                  placeholder="自分の言葉で書く（例：朝が楽しみになってほしい）"
                  style={{
                    flex: 1, padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid var(--color-border)", background: "var(--color-bg)",
                    fontSize: 13, color: "var(--color-fg)", fontFamily: "inherit", outline: "none",
                  }}
                />
                <button
                  onClick={addVibe}
                  style={{
                    flexShrink: 0, padding: "0 18px", borderRadius: 12, border: "none",
                    background: vibeInput.trim() ? "var(--color-accent)" : "var(--color-surface-alt)",
                    color: vibeInput.trim() ? "#fff" : "var(--color-fg-subtle)",
                    fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  追加
                </button>
              </div>
              {/* 候補にない自由追加分の表示 */}
              {selectedVibes.filter((v) => !vibeCandidates.includes(v)).length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {selectedVibes.filter((v) => !vibeCandidates.includes(v)).map((v) => (
                    <button
                      key={v}
                      onClick={() => toggleVibe(v)}
                      style={{
                        fontSize: 12, padding: "7px 14px", borderRadius: 100,
                        border: "1.5px solid var(--color-accent)",
                        background: "var(--color-accent)", color: "#fff",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                      }}
                    >
                      {v} ×
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 入力に反応するヒント（相槌） */}
        {step === 1 && loves.length > 0 && echoPosts.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
              その「好き」に贈った人がいます
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {echoPosts.slice(0, 2).map(hintCard)}
            </div>
          </>
        )}
        {step === 2 && memo.trim().length > 2 && echoPosts.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
              近いことを考えていた人がいます
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {echoPosts.slice(0, 3).map(hintCard)}
            </div>
          </>
        )}
        {step === 3 && selectedIds.length === 0 && echoPosts.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 10 }}>
              かけらの出どころ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {echoPosts.slice(0, 2).map(hintCard)}
            </div>
          </>
        )}

        {/* その人ノート */}
        {noteBoard()}

        {/* ナビゲーション */}
        <div style={{ marginTop: 20 }}>
          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              style={{
                width: "100%", padding: 16, borderRadius: 100, border: "none",
                background: "var(--color-accent)", color: "#fff",
                fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
              }}
            >
              次の問いへ →
            </button>
          ) : (
            <button
              onClick={handleGoResult}
              disabled={!canFinish}
              style={{
                width: "100%", padding: 16, borderRadius: 100, border: "none",
                background: canFinish ? "var(--color-accent)" : "var(--color-surface-alt)",
                color: canFinish ? "#fff" : "var(--color-fg-subtle)",
                fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                cursor: canFinish ? "pointer" : "not-allowed",
                boxShadow: canFinish ? "0 4px 20px rgba(232,80,42,0.35)" : "none",
                transition: "all 220ms ease-out",
              }}
            >
              方向が見えてきた →
            </button>
          )}
          <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", textAlign: "center", marginTop: 10 }}>
            {step < 3 ? "書けなくても大丈夫。飛ばして進めます" : "ノートの中身が「想いの一文」になります"}
          </div>
        </div>
      </div>
    );
  }

  // ── result：想いの一文 → モノに出会う ────────────────
  if (phase === "result") {
    return (
      <div style={{ padding: "24px 20px 110px" }}>
        {headerRow(() => { setStep(3); setPhase("meguru"); }, "もう少し考える")}

        {/* 想いの一文＝この画面の主役 */}
        <div style={{
          background: "linear-gradient(135deg, var(--color-accent-light) 0%, #fff8f5 100%)",
          border: "1.5px solid rgba(232,80,42,0.25)",
          borderRadius: 20, padding: "18px 18px 14px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 10, color: "var(--color-accent)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
            こんなふうに喜んでほしい
          </div>
          <textarea
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            rows={3}
            style={{
              width: "100%", border: "none", outline: "none", background: "transparent",
              fontSize: 16, fontWeight: 800, color: "var(--color-fg)",
              fontFamily: "inherit", resize: "none", lineHeight: 1.7,
            }}
          />
          {(selectedVibes.length > 0 || loves.length > 0) && (
            <>
              <div style={{ height: 1, background: "rgba(232,80,42,0.15)", margin: "10px 0" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {loves.map((v) => (
                  <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#fff", border: "1px solid rgba(232,80,42,0.2)", color: "var(--color-accent)", fontWeight: 600 }}>♡ {v}</span>
                ))}
                {selectedVibes.map((v) => (
                  <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(232,80,42,0.08)", color: "var(--color-accent)", fontWeight: 600 }}>{v}</span>
                ))}
              </div>
            </>
          )}
          <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 8 }}>自由に書き直してOK</div>
        </div>

        {/* インサイト */}
        {insight && (
          <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 10, color: "var(--color-fg-muted)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>
              {relation} × {scene} で大事にされていること
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.6 }}>
              {insight.credo}
            </div>
          </div>
        )}

        {ranked.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-fg-subtle)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎁</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 8 }}>
              まだ近い記録がありません
            </div>
            <div style={{ fontSize: 13 }}>条件を変えるか、あなたが最初の記録者になろう</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.04em" }}>
              この想いに近い記録
            </div>
            <PrimaryCard post={primary!} likes={likes} onTapPost={onTapPost} />

            {secondaries.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.04em" }}>
                  他にも近い記録
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
          <div style={{ marginTop: 24 }}>
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

        {/* 結果はゴールではなく思考の途中経過 */}
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: 15, borderRadius: 100, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
            }}
          >
            この想いを保存
          </button>
          <button
            onClick={onCompose}
            style={{
              flex: 1, padding: 15, borderRadius: 100,
              border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
              fontSize: 14, fontWeight: 600, color: "var(--color-fg)",
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            贈った！記録する
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", textAlign: "center", marginTop: 10, lineHeight: 1.7 }}>
          保存すると「考え中の相手」に積まれて、いつでも続きから考えられます
        </div>
      </div>
    );
  }

  return null;
}
