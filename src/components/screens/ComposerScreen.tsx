"use client";

import { useState, useRef } from "react";
import type { Post, Relation, PriceRange, Scene } from "@/types";
import { createPost, uploadPostImage, getCurrentUser } from "@/lib/api";
import { RELATIONS, PRICES, SCENES } from "@/lib/validation";
import TagChip from "@/components/ui/TagChip";
import Icon from "@/components/ui/Icon";

interface ComposerScreenProps {
  onPost: (post: Post) => void;
}

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 100, flexShrink: 0,
      background: done ? "var(--color-accent)" : "var(--color-surface)",
      border: done ? "none" : "1.5px solid var(--color-border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700,
      color: done ? "#fff" : "var(--color-fg-muted)",
      boxShadow: done ? "0 2px 8px rgba(255, 90, 31, 0.25)" : "none",
      transition: "all 250ms ease",
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
  const [about, setAbout] = useState("");
  const [reason, setReason] = useState("");
  const [scene, setScene] = useState<Scene | null>(null);
  const [url, setUrl] = useState("");
  const [reaction, setReaction] = useState("");
  const [relationCustom, setRelationCustom] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = !!(relation && price && itemName.trim() && reason.trim());

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!canPost || submitting) return;
    if (!relation || !price) return;

    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const user = await getCurrentUser();
        if (user) {
          imageUrl = await uploadPostImage(imageFile, user.id);
        }
      }

      const newPost = await createPost({
        item: itemName.trim(),
        relation,
        scene: scene ?? "なんでもない日",
        price,
        about: about.trim(),
        reason: reason.trim(),
        reaction: reaction.trim() || undefined,
        imageUrl,
        url: url.trim() || undefined,
      });
      setPosted(true);
      setTimeout(() => onPost(newPost), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "投稿に失敗しました");
      setSubmitting(false);
    }
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
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)", textAlign: "center", letterSpacing: "-0.02em" }}>投稿できました</div>
        <div style={{ fontSize: 14, color: "var(--color-fg-muted)", textAlign: "center", lineHeight: 1.8 }}>
          あなたの「はい、どうぞ」が<br />みんなの参考になります
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px" }}>

        {/* エラー表示 */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "12px 16px", borderRadius: 14,
            background: "rgba(232,80,42,0.08)", border: "1.5px solid var(--color-accent)",
            fontSize: 13, color: "var(--color-accent)", lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* Step 1 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={1} done={!!relation} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>誰に贈りましたか？</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map((r) => (
              <TagChip key={r} label={r} selected={relation === r} onClick={() => { setRelation(r); if (r !== "その他") setRelationCustom(""); }} />
            ))}
          </div>
          {relation === "その他" && (
            <input
              type="text"
              value={relationCustom}
              onChange={(e) => setRelationCustom(e.target.value)}
              placeholder="例: 推し、ご近所さん、先輩"
              style={{ ...inputStyle, marginTop: 10, fontSize: 13 }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
            />
          )}
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={2} done={!!scene} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>どんなシチュエーション？</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCENES.map((s) => (
              <TagChip key={s} label={s} selected={scene === s} onClick={() => setScene(scene === s ? null : s)} />
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={3} done={!!price} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>価格帯は？</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRICES.map((p) => (
              <TagChip key={p} label={p} selected={price === p} onClick={() => setPrice(p)} />
            ))}
          </div>
        </div>

        {/* Step 4 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={4} done={!!itemName} />
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
          <div style={{ marginTop: 10 }}>
            <input
              type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="商品URL（任意）https://..."
              style={{ ...inputStyle, fontSize: 13, color: "var(--color-fg-muted)" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; (e.target as HTMLInputElement).style.color = "var(--color-fg)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; if (!url) (e.target as HTMLInputElement).style.color = "var(--color-fg-muted)"; }}
            />
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 4, paddingLeft: 4 }}>
              URLを入力すると商品画像が自動で取得されます
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} style={{ display: "none" }} />
            {imagePreview ? (
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
                <img src={imagePreview} alt="プレビュー" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 16 }} />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  style={{
                    position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 100,
                    background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon name="x" size={14} color="#fff" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 16,
                  border: "1.5px dashed var(--color-border)", background: "var(--color-surface)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 13, color: "var(--color-fg-muted)", fontFamily: "inherit",
                }}
              >
                <Icon name="image" size={16} color="var(--color-fg-muted)" />
                写真を追加（任意）
              </button>
            )}
          </div>
        </div>

        {/* Step 5 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={5} done={!!about} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>贈った相手のこと</div>
          </div>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="どんな人？好きなもの、よく話してたこと、その人らしさ、など"
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>

        {/* Step 6 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={6} done={!!reason} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>なぜこれを選んだの？</div>
          </div>
          <textarea
            value={reason}
            onChange={(e) => { if (e.target.value.length <= 200) setReason(e.target.value); }}
            placeholder="この人のここが好きだから、とか。こういうのが好きって知ってたから、とか。"
            rows={4}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <div style={{
            textAlign: "right", fontSize: 12, marginTop: 4,
            color: reason.length > 170 ? "var(--color-accent)" : "var(--color-fg-subtle)",
          }}>
            {reason.length} / 200
          </div>
        </div>

        {/* Step 7 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <StepBadge n={7} done={!!reaction} />
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)" }}>贈った時のこと</div>
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>（任意）</div>
          </div>
          <textarea
            value={reaction} onChange={(e) => setReaction(e.target.value)}
            placeholder="渡した時の反応、その場の雰囲気、など"
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>
      </div>

      {/* Post button */}
      <div style={{
        flexShrink: 0,
        padding: "12px 20px 20px",
        background: "linear-gradient(to top, var(--color-bg) 80%, transparent)",
      }}>
        <button
          onClick={() => { void handlePost(); }}
          disabled={!canPost || submitting}
          className={canPost && !submitting ? "btn-interactive" : ""}
          style={{
            width: "100%", padding: 16, borderRadius: 100, border: "none",
            background: canPost && !submitting ? "var(--color-accent)" : "var(--color-surface-alt)",
            color: canPost && !submitting ? "#fff" : "var(--color-fg-subtle)",
            fontSize: 16, fontWeight: 700, fontFamily: "inherit",
            cursor: canPost && !submitting ? "pointer" : "not-allowed",
            boxShadow: canPost && !submitting ? "0 6px 20px rgba(255, 90, 31, 0.35), inset 0 1px 1px rgba(255,255,255,0.2)" : "none",
            transition: "all 220ms ease-out", letterSpacing: "0.02em",
          }}
        >
          {submitting ? "送信中…" : canPost ? "はい、どうぞ" : "必須項目を入力してください"}
        </button>
      </div>
    </div>
  );
}
