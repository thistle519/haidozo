"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { Relation, Scene, Post } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import { useOgpImage } from "@/lib/useOgpImage";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "上司", "同僚", "先生・恩師"];
const SCENES: Scene[] = ["誕生日", "記念日", "お礼", "送別", "手土産", "なんでもない日", "応援", "結婚祝い"];

const RELATION_COLOR: Record<string, { from: string; to: string; dot: string }> = {
  "恋人":       { from: "#F9D4C8", to: "#F0A898", dot: "#C43E1E" },
  "友達":       { from: "#C8D4F9", to: "#98A8F0", dot: "#2B3467" },
  "家族":       { from: "#F9EEC8", to: "#F0D898", dot: "#C49A00" },
  "先生・恩師": { from: "#DCC8F9", to: "#BC98F0", dot: "#8250C8" },
  "同僚":       { from: "#C8F0EC", to: "#98E0D8", dot: "#2B8278" },
  "上司":       { from: "#D8D8E8", to: "#B8B8CC", dot: "#646478" },
};

const SCENE_EMOJI: Record<string, string> = {
  "誕生日": "🎂", "記念日": "✨", "お礼": "🌼",
  "送別": "🌸",  "手土産": "🎀", "なんでもない日": "☀️",
  "応援": "💪",  "結婚祝い": "💍",
};

const RELATION_EMOJI: Record<string, string> = {
  "恋人": "💐", "友達": "🎁", "家族": "🏠",
  "先生・恩師": "📖", "同僚": "☕", "上司": "🌿",
};

function getEmoji(post: Post): string {
  return SCENE_EMOJI[post.scene] ?? RELATION_EMOJI[post.relation] ?? "🎁";
}

function getRelated(post: Post, all: Post[]): Post[] {
  return all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      score:
        (p.relation === post.relation ? 2 : 0) +
        (p.scene === post.scene ? 2 : 0) +
        (p.vibes?.filter((v) => post.vibes?.includes(v)).length ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map((x) => x.post);
}

// ── グリッドカード ──────────────────────────────────────────
function EpisodeCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const image = useOgpImage(post.url);
  const colors = RELATION_COLOR[post.relation] ?? { from: "#E0E4F4", to: "#C8CEEA", dot: "#2B3467" };
  const emoji = getEmoji(post);

  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        borderRadius: 14, overflow: "hidden", aspectRatio: "3/4",
        cursor: "pointer", position: "relative",
        background: image
          ? "var(--color-surface-alt)"
          : `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
      }}
    >
      {image ? (
        <img src={image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44, lineHeight: 1,
        }}>
          {emoji}
        </div>
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: image
          ? "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)"
          : "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.18) 100%)",
      }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 11px 12px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4, color: image ? "rgba(255,255,255,0.75)" : colors.dot }}>
          {post.relation} · {post.scene}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, lineHeight: 1.45,
          color: image ? "#fff" : "rgba(30,30,60,0.85)",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        } as React.CSSProperties}>
          {post.vibes?.[0] ?? post.item}
        </div>
      </div>
    </motion.div>
  );
}

// ── 投稿カルーセル（1投稿を3スライドに分割） ──────────────
function PostCarousel({ post }: { post: Post }) {
  const image = useOgpImage(post.url);
  const colors = RELATION_COLOR[post.relation] ?? { from: "#E0E4F4", to: "#C8CEEA", dot: "#2B3467" };
  const emoji = getEmoji(post);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setSlideIndex(index);
  }, []);

  const slides = [
    // スライド1：画像
    <div key="image" style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "start" }}>
      <div style={{
        width: "100%", height: 280, borderRadius: 18, overflow: "hidden", position: "relative",
        background: image ? "var(--color-surface-alt)" : `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
      }}>
        {image ? (
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
            {emoji}
          </div>
        )}
        {/* タグオーバーレイ */}
        <div style={{ position: "absolute", bottom: 14, left: 14, display: "flex", gap: 6 }}>
          {[post.relation, post.scene].map((tag) => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100,
              background: "rgba(0,0,0,0.45)", color: "#fff", backdropFilter: "blur(4px)",
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>,

    // スライド2：なぜこれを選んだか
    <div key="reason" style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "start" }}>
      <div style={{
        height: 280, borderRadius: 18, padding: "24px 22px",
        background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: colors.dot, letterSpacing: "0.08em" }}>
          なぜこれを選んだか
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(30,30,60,0.88)", lineHeight: 1.75 }}>
          {post.reason}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(30,30,60,0.5)" }}>
          {post.item}
        </div>
      </div>
    </div>,

    // スライド3：誰に・どんな相手か
    <div key="about" style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "start" }}>
      <div style={{
        height: 280, borderRadius: 18, padding: "24px 22px",
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.08em" }}>
          贈った相手のこと
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg)", lineHeight: 1.75 }}>
          {post.about}
        </div>
        {post.vibes && post.vibes.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {post.vibes.slice(0, 3).map((v) => (
              <span key={v} style={{
                fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
                background: "var(--color-accent-light)", color: "var(--color-accent)",
              }}>{v}</span>
            ))}
          </div>
        )}
      </div>
    </div>,
  ];

  return (
    <div>
      {/* カルーセル */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: "flex", overflowX: "auto",
          scrollSnapType: "x mandatory", scrollbarWidth: "none",
          gap: 0,
        }}
      >
        {slides}
      </div>
      {/* ドットインジケーター */}
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slideIndex ? 16 : 5, height: 5, borderRadius: 100,
            background: i === slideIndex ? "var(--color-accent)" : "var(--color-border)",
            transition: "all 280ms ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────────────
interface GuidedScreenProps {
  onClose: () => void;
}

type Phase = "context" | "grid" | "detail";

export default function GuidedScreen({ onClose }: GuidedScreenProps) {
  const [phase, setPhase] = useState<Phase>("context");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const filtered = FEED_DATA.filter((p) =>
    !relation ? true : p.relation === relation || (scene ? p.scene === scene : false)
  ).sort((a, b) => {
    const sa = (relation && a.relation === relation ? 3 : 0) + (scene && a.scene === scene ? 2 : 0);
    const sb = (relation && b.relation === relation ? 3 : 0) + (scene && b.scene === scene ? 2 : 0);
    return sb - sa;
  });

  const openDetail = (post: Post) => {
    setSelectedPost(post);
    setPhase("detail");
  };

  // ── Phase: context ──────────────────────────────────────
  if (phase === "context") {
    return (
      <div style={{ padding: "8px 20px 100px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>エピソードから探す</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 8 }}>誰に贈りたいですか？</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 28 }}>近い条件のエピソードが優先的に表示されます。</div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 12 }}>
            誰に？<span style={{ color: "var(--color-accent)", marginLeft: 2 }}>*</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map((r) => (
              <TagChip key={r} label={r} selected={relation === r} onClick={() => setRelation(r)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 4 }}>
            どんな場面で？
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 6 }}>任意</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {SCENES.map((s) => (
              <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} />
            ))}
          </div>
        </div>

        <button
          onClick={() => relation && setPhase("grid")}
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
          エピソードを見てみる
        </button>
      </div>
    );
  }

  // ── Phase: grid ────────────────────────────────────────
  if (phase === "grid") {
    return (
      <div style={{ padding: "8px 14px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button
            onClick={() => setPhase("context")}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-fg-muted)", padding: 0 }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            条件を変える
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {relation && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--color-accent-light)", color: "var(--color-accent)" }}>{relation}</span>}
            {scene && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "var(--color-surface-alt)", color: "var(--color-fg-muted)" }}>{scene}</span>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <EpisodeCard post={post} onClick={() => openDetail(post)} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Phase: detail ──────────────────────────────────────
  if (phase === "detail" && selectedPost) {
    const related = getRelated(selectedPost, FEED_DATA);

    return (
      <div style={{ padding: "8px 16px 100px" }}>
        {/* 戻るボタン */}
        <button
          onClick={() => setPhase("grid")}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 16 }}
        >
          <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
          もどる
        </button>

        {/* 3スライドカルーセル */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <PostCarousel post={selectedPost} />
        </motion.div>

        {/* アイテム名 + リンク */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            marginTop: 16, background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)", flex: 1, marginRight: 12 }}>{selectedPost.item}</div>
          {selectedPost.url && (
            <a
              href={selectedPost.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                fontSize: 12, fontWeight: 700, color: "var(--color-accent)",
                textDecoration: "none", padding: "6px 12px", borderRadius: 100,
                background: "var(--color-accent-light)",
              }}
            >
              見てみる
              <Icon name="external-link" size={12} color="var(--color-accent)" />
            </a>
          )}
        </motion.div>

        {/* 関連エピソード（グリッド） */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 12 }}>
              関連するエピソード
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
              {related.slice(0, 6).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <EpisodeCard post={post} onClick={() => openDetail(post)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: 16, borderRadius: 100, border: "none",
            background: "var(--color-accent)", color: "#fff",
            fontSize: 16, fontWeight: 700, fontFamily: "inherit",
            cursor: "pointer", boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
          }}
        >
          この方向で探す
        </button>
      </div>
    );
  }

  return null;
}
