"use client";

import { useState } from "react";
import type { Relation, Scene } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "上司", "同僚", "先生・恩師"];
const SCENES: Scene[] = ["誕生日", "記念日", "お礼", "送別", "なんでもない日"];

interface GuidedScreenProps {
  onClose: () => void;
}

type Phase = "context" | "episode" | "resolved";

export default function GuidedScreen({ onClose }: GuidedScreenProps) {
  const [phase, setPhase] = useState<Phase>("context");
  const [relation, setRelation] = useState<Relation | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [resonatedId, setResonatedId] = useState<number | null>(null);

  // Prioritize matching relation/scene, then show rest
  const ordered = [
    ...FEED_DATA.filter((p) =>
      (relation ? p.relation === relation : false) ||
      (scene ? p.scene === scene : false)
    ),
    ...FEED_DATA.filter((p) =>
      !(relation ? p.relation === relation : false) &&
      !(scene ? p.scene === scene : false)
    ),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  const currentPost = ordered[episodeIndex];
  const resonatedPost = FEED_DATA.find((p) => p.id === resonatedId);

  const handleYes = () => {
    setResonatedId(currentPost.id);
    setPhase("resolved");
  };

  const handleNo = () => {
    if (episodeIndex < ordered.length - 1) {
      setEpisodeIndex((i) => i + 1);
    } else {
      // 全部見た → 最初から
      setEpisodeIndex(0);
    }
  };

  // ── Phase: context ─────────────────────────────────────────
  if (phase === "context") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 20px 100px" }}>

          {/* Back */}
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 28,
            }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            もどる
          </button>

          <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em" }}>
            エピソードから探す
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.35, marginBottom: 8 }}>
            誰に贈りたいですか？
          </div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 32 }}>
            近い条件のエピソードを見ながら、<br />プレゼントの方向性を一緒に探しましょう。
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 12 }}>
              誰に？<span style={{ color: "var(--color-accent)", marginLeft: 2 }}>*</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {RELATIONS.map((r) => (
                <TagChip key={r} label={r} selected={relation === r} onClick={() => setRelation(r)} />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg)", marginBottom: 4 }}>
              どんな時に？
              <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-fg-muted)", marginLeft: 6 }}>任意</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {SCENES.map((s) => (
                <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: "12px 20px 20px", background: "linear-gradient(to top, var(--color-bg) 80%, transparent)" }}>
          <button
            onClick={() => relation && setPhase("episode")}
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
      </div>
    );
  }

  // ── Phase: episode ─────────────────────────────────────────
  if (phase === "episode" && currentPost) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 120px" }}>

          {/* Back */}
          <button
            onClick={() => { setPhase("context"); setEpisodeIndex(0); }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--color-fg-muted)", padding: 0, marginBottom: 28,
            }}
          >
            <Icon name="arrow-left" size={16} color="var(--color-fg-muted)" />
            条件を変える
          </button>

          {/* Label */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>
            こんな選び方をした人がいます
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-fg)", marginBottom: 20, lineHeight: 1.4 }}>
            {currentPost.relation}への<br />{currentPost.scene}のプレゼント
          </div>

          {/* Episode Card */}
          <div style={{
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 20, padding: 20, marginBottom: 20,
          }}>
            {/* Tags */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
              }}>{currentPost.relation}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
              }}>{currentPost.scene}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
              }}>{currentPost.price}</span>
            </div>

            {/* About (recipient) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>
                贈った相手のこと
              </div>
              <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8, fontWeight: 400 }}>
                {currentPost.about}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--color-border)", margin: "16px 0" }} />

            {/* Reason */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-fg-subtle)", letterSpacing: "0.06em", marginBottom: 6 }}>
                なぜこれを選んだか
              </div>
              <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>
                {currentPost.reason}
              </div>
            </div>

            {/* Item name */}
            <div style={{
              marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--color-border)",
              fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 500,
            }}>
              {currentPost.item}
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            {ordered.map((_, i) => (
              <div key={i} style={{
                width: i === episodeIndex ? 18 : 6, height: 6, borderRadius: 100,
                background: i === episodeIndex ? "var(--color-accent)" : "var(--color-border)",
                transition: "all 300ms ease",
              }} />
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--color-fg-subtle)" }}>
            {episodeIndex + 1} / {ordered.length}
          </div>
        </div>

        {/* CTA */}
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

  // ── Phase: resolved ────────────────────────────────────────
  if (phase === "resolved" && resonatedPost) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 20px 120px" }}>

          {/* Check mark */}
          <div style={{
            width: 60, height: 60, borderRadius: 100,
            background: "var(--color-sage-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <Icon name="check" size={28} color="#8B6F00" />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.08em", marginBottom: 8 }}>
            視点が見つかりました
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.4, marginBottom: 6 }}>
            こんなプレゼントを<br />選んでみませんか？
          </div>
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7, marginBottom: 28 }}>
            このエピソードのような視点で<br />プレゼントを探してみましょう。
          </div>

          {/* Resonated episode (condensed) */}
          <div style={{
            background: "var(--color-surface)",
            border: "2px solid var(--color-accent)",
            borderRadius: 20, padding: 20, marginBottom: 8,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                background: "rgba(232,80,42,0.1)", color: "var(--color-accent)",
              }}>{resonatedPost.relation}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
                background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
              }}>{resonatedPost.scene}</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8, marginBottom: 12 }}>
              {resonatedPost.reason}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-fg-muted)", fontWeight: 500 }}>
              {resonatedPost.item}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{
          flexShrink: 0, padding: "12px 20px 20px",
          background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <button
            onClick={onClose}
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
            onClick={() => { setPhase("episode"); setEpisodeIndex(0); setResonatedId(null); }}
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

  return null;
}
