"use client";

import { useState } from "react";
import type { Relation, PriceRange, Scene } from "@/types";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "上司", "同僚"];
const PRICES: PriceRange[] = ["〜3,000円", "〜5,000円", "〜10,000円", "それ以上"];
const SCENES: Scene[] = ["誕生日", "記念日", "お礼", "送別", "なんでもない日"];

interface ComposerScreenProps {
  onPost: () => void;
}

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 100, flexShrink: 0,
      background: done ? "var(--color-accent)" : "var(--color-surface-alt)",
      border: done ? "none" : "1.5px solid var(--color-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700,
      color: done ? "#fff" : "var(--color-fg-muted)",
    }}>
      {done ? <Icon name="check" size={12} color="#fff" /> : n}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 16,
  border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
  fontSize: 15, color: "var(--color-fg)", outline: "none",
  transition: "border-color 200ms ease-out", fontFamily: "inherit",
};

export default function ComposerScreen({ onPost }: ComposerScreenProps) {
  const [relation, setRelation] = useState<Relation | null>(null);
  const [price, setPrice] = useState<PriceRange | null>(null);
  const [itemName, setItemName] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [url, setUrl] = useState("");
  const [episode, setEpisode] = useState("");
  const [posted, setPosted] = useState(false);

  const canPost = !!(relation && price && itemName.trim() && note.trim());

  const handlePost = () => {
    if (!canPost) return;
    setPosted(true);
    setTimeout(() => onPost(), 1400);
  };

  if (posted) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16, padding: 32, height: "100%",
      }}>
        <div className="animate-slide-up" style={{
          width: 80, height: 80, borderRadius: 100,
          background: "var(--color-sage-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="check" size={36} color="#8B6F00" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", textAlign: "center" }}>投稿できました！</div>
        <div style={{ fontSize: 14, color: "var(--color-fg-muted)", textAlign: "center", lineHeight: 1.8 }}>
          あなたの「はい、どうぞ」が<br />みんなの参考になります
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 120px" }}>

        {/* Step 1 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={1} done={!!relation} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>誰に贈りましたか？</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map((r) => (
              <TagChip key={r} label={r} selected={relation === r} onClick={() => setRelation(r)} />
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={2} done={!!price} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>価格帯は？</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRICES.map((p) => (
              <TagChip key={p} label={p} selected={price === p} onClick={() => setPrice(p)} />
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={3} done={!!itemName} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>何を贈りましたか？</div>
          </div>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="例：ジョーマローン ピオニー"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <div style={{
            marginTop: 12, border: "1.5px dashed var(--color-border)", borderRadius: 16,
            padding: 14, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, color: "var(--color-fg-muted)", fontSize: 13, cursor: "pointer",
            background: "var(--color-surface)",
          }}>
            <Icon name="image" size={18} color="var(--color-fg-muted)" />
            画像をアップロード（任意）
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={4} done={!!note} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>ひとことどうぞ</div>
          </div>
          <textarea
            value={note}
            onChange={(e) => { if (e.target.value.length <= 140) setNote(e.target.value); }}
            placeholder="贈ったときのエピソードや気持ちを書いてみてください"
            rows={4}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <div style={{
            textAlign: "right", fontSize: 12, marginTop: 4,
            color: note.length > 120 ? "var(--color-accent)" : "var(--color-fg-subtle)",
          }}>
            {note.length} / 140
          </div>
        </div>

        {/* Expand */}
        <div
          onClick={() => setExpanded((e) => !e)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 16,
            border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
            cursor: "pointer", marginBottom: expanded ? 12 : 0,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg-muted)" }}>もっと詳しく書く</div>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={18} color="var(--color-fg-muted)" />
        </div>

        {expanded && (
          <div className="animate-fade-in" style={{
            background: "var(--color-surface)", border: "1.5px solid var(--color-border)",
            borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", marginBottom: 10 }}>シーン</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SCENES.map((s) => (
                  <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} variant="sage" />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", marginBottom: 8 }}>購入URL</div>
              <input
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                style={{ ...inputStyle, borderRadius: 12, padding: "10px 14px", background: "var(--color-bg)" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", marginBottom: 8 }}>エピソード詳細</div>
              <textarea
                value={episode} onChange={(e) => setEpisode(e.target.value)}
                placeholder="もう少し詳しいエピソードを..."
                rows={3}
                style={{ ...inputStyle, borderRadius: 12, padding: "10px 14px", background: "var(--color-bg)", resize: "none", lineHeight: 1.7 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Post button */}
      <div style={{
        position: "absolute", bottom: 72, left: 0, right: 0,
        padding: "12px 20px",
        background: "linear-gradient(to top, var(--color-bg) 70%, transparent)",
      }}>
        <button
          onClick={handlePost}
          disabled={!canPost}
          style={{
            width: "100%", padding: 16, borderRadius: 100, border: "none",
            background: canPost ? "var(--color-accent)" : "var(--color-surface-alt)",
            color: canPost ? "#fff" : "var(--color-fg-subtle)",
            fontSize: 16, fontWeight: 700, fontFamily: "inherit",
            cursor: canPost ? "pointer" : "not-allowed",
            boxShadow: canPost ? "0 4px 20px rgba(232,80,42,0.35)" : "none",
            transition: "all 220ms ease-out", letterSpacing: "0.02em",
          }}
        >
          {canPost ? "はい、どうぞ！" : "必須項目を入力してください"}
        </button>
      </div>
    </div>
  );
}
