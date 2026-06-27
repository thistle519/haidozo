"use client";

import { useState, useMemo } from "react";
import type { Post, Plan, Relation, Scene } from "@/types";
import { expandQuery, postFullText } from "@/lib/searchUtils";
import { buildMockMitates, getRelatedPostsForMitate, pickMitateFragment } from "@/lib/mockMitates";
import { useOgpImage } from "@/lib/useOgpImage";
import PostTags from "@/components/ui/PostTags";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

// ────────────────────────────────────
// なにあげよ？ — 統合された唯一の「考える」動線
// home（あとで考える）→ start（前提条件）→ meguru（3つの問い×反応するヒント）→ result（これ、いいかも→モノ）
//
// 旧UX設計から引き継いだ流れ:
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

const LOVE_IDEA_CHIPS = ["映画", "香り", "服", "コーヒー", "本", "音楽", "お出かけ", "おうち時間"];

const BASE_VIBE_CHOICES = [
  "ちゃんと見てたことが伝わる",
  "一緒にいる時間が楽しみになる",
  "相手の世界が少し広がる",
  "忙しい日でも受け取りやすい",
];

function inferVibeChoices(
  candidates: string[],
  relation: Relation | null,
  scene: Scene | null,
  loves: string[],
  memo: string,
  needsLoveHelp: boolean,
): string[] {
  const text = [relation, scene, ...loves, memo].filter(Boolean).join(" ");
  const inferred: string[] = [];

  if (relation === "恋人" || scene === "記念日") {
    inferred.push("ちゃんと見てたことが伝わる", "一緒にいる時間が楽しみになる");
  }
  if (/忙し|仕事|疲|休|切り替え|がんば/.test(text)) {
    inferred.push("忙しい日でも受け取りやすい", "自分に戻る時間をつくれる");
  }
  if (/映画|音楽|本|服|香り|コーヒー|カフェ|旅行|お出かけ/.test(text)) {
    inferred.push("相手の世界が少し広がる", "好きなものを一緒に楽しめる");
  }
  if (needsLoveHelp) {
    inferred.push("好きなものを一緒に思い出せる", "選ぶ時間ごと軽くなる");
  }

  return [...new Set([...inferred, ...candidates, ...BASE_VIBE_CHOICES])].slice(0, 4);
}

// ────────────────────────────────────
// サブコンポーネント: 過去投稿カード
// ────────────────────────────────────
interface CardProps {
  post: Post;
  likes: Record<string, boolean>;
  onTapPost: (p: Post) => void;
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

function TeaserCard({ post, onTapPost, featured = false }: Pick<CardProps, "post" | "onTapPost"> & { featured?: boolean }) {
  const image = useOgpImage(post.url);
  return (
    <button
      type="button"
      onClick={() => onTapPost(post)}
      style={{
        gridColumn: featured ? "span 2" : "span 1",
        minHeight: featured ? 228 : 184,
        border: "none",
        borderRadius: 18,
        overflow: "hidden",
        background: "var(--color-surface)",
        boxShadow: "var(--hz-shadow-soft)",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{
        height: featured ? 132 : 92,
        background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-sun-tint))",
        overflow: "hidden",
        position: "relative",
      }}>
        {image ? (
          <img src={image} alt={`${post.item}の候補画像`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-accent)",
          }}>
            <Icon name="gift" size={featured ? 28 : 22} color="var(--color-accent)" />
          </div>
        )}
        <div style={{
          position: "absolute",
          left: 10,
          top: 10,
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
        }}>
          {[post.relation, post.scene].map((t) => (
            <span key={t} style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 999,
              background: "rgba(255, 247, 237, 0.92)",
              color: "var(--color-fg)",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: featured ? "13px 14px 15px" : "11px 12px 13px", flex: 1 }}>
        <div style={{
          fontSize: featured ? 14 : 12,
          fontWeight: 800,
          color: "var(--color-fg)",
          lineHeight: 1.45,
          marginBottom: 6,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: featured ? 2 : 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.item}
        </div>
        <div style={{
          fontSize: featured ? 12 : 11,
          color: "var(--color-fg-muted)",
          lineHeight: 1.65,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: featured ? 2 : 3,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.reason}
        </div>
      </div>
    </button>
  );
}

// ────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────
type Phase = "home" | "start" | "meguru" | "result";

interface SearchScreenProps {
  posts: Post[];
  likes: Record<string, boolean>;
  onTapPost: (post: Post) => void;
  plans: Plan[];
  onSavePlan: (plan: Plan) => void;
  onCompose: () => void;
}

export default function SearchScreen({ posts: allPosts, likes, onTapPost, plans, onSavePlan, onCompose }: SearchScreenProps) {
  const [phase, setPhase] = useState<Phase>("home");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 作業中のプラン状態
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [loves, setLoves] = useState<string[]>([]);
  const [needsLoveHelp, setNeedsLoveHelp] = useState(false);
  const [loveInput, setLoveInput] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeInput, setVibeInput] = useState("");
  const [wish, setWish] = useState("");
  const [currentMitateIndex, setCurrentMitateIndex] = useState(0);

  const resetWork = () => {
    setEditingPlanId(null);
    setLabel("");
    setRelation(null);
    setScene(null);
    setLoves([]);
    setNeedsLoveHelp(false);
    setLoveInput("");
    setMemo("");
    setSelectedIds([]);
    setSelectedVibes([]);
    setVibeInput("");
    setWish("");
    setCurrentMitateIndex(0);
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
    setNeedsLoveHelp(false);
    setMemo(plan.memo);
    setSelectedIds(plan.selectedIds);
    setSelectedVibes(plan.vibes);
    setWish(plan.wish);
    setCurrentMitateIndex(0);
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
    setNeedsLoveHelp(false);
    setLoves((prev) => [...prev, v]);
    setLoveInput("");
  };
  const addLoveIdea = (v: string) => {
    setNeedsLoveHelp(false);
    setLoves((prev) => prev.includes(v) ? prev : [...prev, v]);
  };
  const removeLove = (v: string) => setLoves((prev) => prev.filter((x) => x !== v));
  const markLoveUnknown = () => {
    setLoveInput("");
    setNeedsLoveHelp(true);
  };

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
    return [...allPosts]
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
  }, [allPosts, relation, scene, loves, memo]);

  // テキスト入力に実際にマッチしたものだけ「相槌」として出す
  const echoPosts = useMemo(
    () => relatedPosts.filter(({ score }) => score >= 3).map(({ post }) => post),
    [relatedPosts]
  );

  // Step3: ここまでの入力から、しっくり来そうな気持ちだけ少数に絞る
  const rawVibeCandidates = useMemo(() => {
    const fromSelected = allPosts.filter((p) => selectedIds.includes(p.id)).flatMap((p) => p.vibes ?? []);
    const fromRelated = relatedPosts.slice(0, 5).flatMap(({ post }) => post.vibes ?? []);
    return [...new Set([...fromSelected, ...fromRelated])];
  }, [allPosts, selectedIds, relatedPosts]);
  const vibeCandidates = useMemo(
    () => inferVibeChoices(rawVibeCandidates, relation, scene, loves, memo, needsLoveHelp),
    [rawVibeCandidates, relation, scene, loves, memo, needsLoveHelp]
  );

  // ── haidozoからの提案 ──
  const query = useMemo(
    () => [
      relation,
      scene,
      ...selectedVibes,
      ...loves,
      needsLoveHelp ? "好きなものが思いつかない" : "",
      memo,
    ].filter(Boolean).join("、"),
    [relation, scene, selectedVibes, loves, needsLoveHelp, memo]
  );

  const mitateFragment = useMemo(
    () => pickMitateFragment(memo, loves, selectedVibes),
    [memo, loves, selectedVibes]
  );
  const mitates = useMemo(
    () => buildMockMitates(mitateFragment, query),
    [mitateFragment, query]
  );
  const activeMitate = mitates[currentMitateIndex % mitates.length];
  const relatedMitatePosts = useMemo(
    () => getRelatedPostsForMitate(activeMitate, allPosts, relation, scene),
    [activeMitate, allPosts, relation, scene]
  );

  const canFinish = selectedVibes.length > 0 || memo.trim().length > 0 || loves.length > 0 || needsLoveHelp;

  const handleGoResult = () => {
    if (!wish.trim()) setWish(buildWish(selectedVibes, memo, loves));
    setCurrentMitateIndex(0);
    setPhase("result");
  };

  const showNextMitate = () => {
    setCurrentMitateIndex((prev) => (prev + 1) % mitates.length);
  };

  const handleSave = () => {
    if (!relation) return;
    const saveWish = wish.trim() || `${activeMitate.category}で、${activeMitate.axis}を贈る感じ。`;
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
      wish: saveWish,
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
        boxShadow: isSelected ? "var(--hz-shadow-pop)" : "var(--shadow-1)",
        transition: "all 200ms ease",
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {[p.relation, p.scene].map((t) => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: isSelected ? "var(--hz-orange-wash)" : "var(--color-surface-alt)", color: isSelected ? "var(--color-accent)" : "var(--color-fg-muted)" }}>{t}</span>
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
    const hasContent = loves.length > 0 || needsLoveHelp || memo.trim() || selectedVibes.length > 0;
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
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: needsLoveHelp || memo.trim() || selectedVibes.length > 0 ? 8 : 0 }}>
            {loves.map((v) => (
              <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-fg)", fontWeight: 600 }}>♡ {v}</span>
            ))}
          </div>
        )}
        {needsLoveHelp && (
          <div style={{
            fontSize: 12,
            color: "var(--color-fg-muted)",
            lineHeight: 1.7,
            marginBottom: memo.trim() || selectedVibes.length > 0 ? 8 : 0,
          }}>
            好きなものは、話しながら思い出す
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
              <span key={v} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "var(--hz-orange-wash)", color: "var(--color-accent)", fontWeight: 600 }}>{v}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── home：なにあげよ？の入口 ──────────
  if (phase === "home") {
    const teasers = allPosts.filter((p) => p.vibes && p.vibes.length > 0).slice(0, 7);
    return (
      <div style={{ padding: "24px 20px 110px" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.04em", marginBottom: 8 }}>
          なにあげよ？
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 6 }}>
          まず、誰のこと<br />考える？
        </div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 22 }}>
          プレゼントを考える時間を、ちょっと楽しく
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
            background: "var(--color-accent)", boxShadow: "var(--hz-shadow-cta)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="plus" size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)" }}>あたらしく「なにあげよ？」</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2 }}>誰かの顔が浮かんだら、ここから</div>
          </div>
        </div>

        {/* あとで考える */}
        {plans.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.04em", marginBottom: 12 }}>
              あとで考える（{plans.length}）
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
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "28px 0 12px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-fg)", letterSpacing: "0.01em" }}>
            これどうかな？ みんなの候補
          </div>
          <div style={{ fontSize: 11, color: "var(--color-fg-muted)", fontWeight: 700 }}>
            のぞいてみる
          </div>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}>
          {teasers.map((p, index) => (
            <TeaserCard
              key={p.id}
              post={p}
              onTapPost={onTapPost}
              featured={index === 0}
            />
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
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.04em", marginBottom: 8 }}>
          なにあげよ？
        </div>
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
            boxShadow: relation ? "var(--hz-shadow-cta)" : "none",
            transition: "all 220ms ease-out",
          }}
        >
          この人の「なにあげよ？」を始める
        </button>
      </div>
    );
  }

  // ── meguru：3つの問い × 反応するヒント ────────────────
  if (phase === "meguru") {
    const stepMeta = {
      1: { title: "その人、何が好き？", sub: "まだ曖昧で大丈夫。思いつくものだけ、あとで足せます" },
      2: { title: "ふと思い出すエピソードは？", sub: "一緒にいた場面、最近の会話、その人らしい瞬間" },
      3: { title: "どんなふうに喜んでほしい？", sub: "ここまでのメモから、近そうなものだけ置いておきます" },
    }[step];

    return (
      <div style={{ padding: "24px 20px 110px" }}>
        {headerRow(() => (step === 1 ? setPhase("start") : setStep((step - 1) as 1 | 2 | 3)), step === 1 ? "条件を変える" : "前の問いへ")}

        {/* ステップインジケーター */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.04em" }}>
            これどうかな？
          </span>
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
                  placeholder="例：映画、香り、よく行くお店"
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
                  メモ
                </button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                <button
                  type="button"
                  onClick={markLoveUnknown}
                  style={{
                    fontSize: 12,
                    padding: "7px 12px",
                    borderRadius: 999,
                    border: `1.5px solid ${needsLoveHelp ? "var(--color-accent)" : "var(--color-border)"}`,
                    background: needsLoveHelp ? "var(--hz-orange-wash)" : "var(--color-surface)",
                    color: needsLoveHelp ? "var(--color-accent)" : "var(--color-fg-muted)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 800,
                  }}
                >
                  好きなものが思いつかない
                </button>
                {LOVE_IDEA_CHIPS.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => addLoveIdea(v)}
                    style={{
                      fontSize: 12,
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: "1px solid var(--color-border)",
                      background: loves.includes(v) ? "var(--color-accent)" : "var(--color-surface)",
                      color: loves.includes(v) ? "#fff" : "var(--color-fg)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 700,
                    }}
                  >
                    {v}
                  </button>
                ))}
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
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-fg-muted)", marginBottom: 8 }}>
                    haidozoが近そうだと思ったもの
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {vibeCandidates.map((v) => (
                      <button
                        key={v}
                        onClick={() => toggleVibe(v)}
                        style={{
                          fontSize: 12, padding: "8px 13px", borderRadius: 100,
                          border: `1.5px solid ${selectedVibes.includes(v) ? "var(--color-accent)" : "var(--color-border)"}`,
                          background: selectedVibes.includes(v) ? "var(--color-accent)" : "var(--color-surface)",
                          color: selectedVibes.includes(v) ? "#fff" : "var(--color-fg)",
                          cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
                          transition: "all 150ms ease",
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </>
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
                boxShadow: "var(--hz-shadow-cta)",
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
                boxShadow: canFinish ? "var(--hz-shadow-cta)" : "none",
                transition: "all 220ms ease-out",
              }}
            >
              方向が見えてきた →
            </button>
          )}
          <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", textAlign: "center", marginTop: 10 }}>
            {step < 3 ? "書けなくても大丈夫。飛ばして進めます" : "ノートの中身が「これ、いいかも」につながります"}
          </div>
        </div>
      </div>
    );
  }

  // ── result：haidozoからの提案 ────────────────
  if (phase === "result") {
    const targetName = label.trim() || relation || "あの人";

    return (
      <div style={{ padding: "24px 20px 110px" }}>
        {headerRow(() => { setStep(3); setPhase("meguru"); }, "もう少し考える")}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.04em", marginBottom: 8 }}>
            haidozoからの提案
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 8 }}>
            {targetName}には、<br />こんなのどうかな？
          </div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
            まだ決めなくて大丈夫。近いプレゼント記録も見ながら考えよう
          </div>
        </div>

        <div style={{
          background: "var(--color-surface)",
          border: "2px solid var(--color-accent)",
          borderRadius: 22,
          padding: "18px 18px 16px",
          boxShadow: "var(--hz-shadow-soft)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 800, letterSpacing: "0.04em" }}>
              提案 {currentMitateIndex + 1}/{mitates.length}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 700, marginBottom: 7 }}>
              {targetName}のメモから
            </div>
            <div style={{
              background: "var(--hz-orange-wash)",
              borderRadius: 14,
              padding: "12px 14px",
              fontSize: 15,
              color: "var(--color-fg)",
              lineHeight: 1.7,
              fontWeight: 700,
            }}>
              「{activeMitate.fragment}」
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 20, color: "var(--color-fg)", fontWeight: 800, lineHeight: 1.4, marginBottom: 8 }}>
              {activeMitate.category}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 800, lineHeight: 1.6 }}>
              {activeMitate.axis}
            </div>
          </div>

          <div style={{
            borderTop: "1px solid var(--color-border)",
            padding: "16px 0 4px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.9, fontWeight: 600 }}>
              {activeMitate.reason}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <button
              onClick={showNextMitate}
              style={{
                width: "100%",
                padding: 15,
                borderRadius: 999,
                border: "none",
                background: "var(--color-accent)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: "var(--hz-shadow-cta)",
              }}
            >
              別の提案を見る
            </button>
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 999,
                border: "none",
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              あとで考える
            </button>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 13, color: "var(--color-fg)", fontWeight: 800, marginBottom: 10 }}>
            近い気持ちで贈られたプレゼント
          </div>
          {relatedMitatePosts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {relatedMitatePosts.map((post) => (
                <SecondaryCard key={post.id} post={post} likes={likes} onTapPost={onTapPost} />
              ))}
            </div>
          ) : (
            <div style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "18px 16px",
              color: "var(--color-fg-muted)",
              fontSize: 13,
              lineHeight: 1.7,
            }}>
              近い記録はまだ少なめ。まずはこの方向だけ、持ち帰って考えてみよう。
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", textAlign: "center", marginTop: 14, lineHeight: 1.7 }}>
          保存すると「あとで考える」に残って、いつでも続きから考えられます
        </div>
      </div>
    );
  }

  return null;
}
