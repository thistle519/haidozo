"use client";

import { useState } from "react";
import Icon from "./Icon";

/**
 * いいねボタン（共通）
 * - タップでハートが弾み、カラフルな粒が飛ぶ（いいね時のみ）
 * - appearance:
 *   - "wash": フィードカード用（オレンジウォッシュのピル）
 *   - "outline": 詳細画面用（ボーダー付きピル）
 */
interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  appearance?: "wash" | "outline";
  iconSize?: number;
}

const BURST_COLORS = [
  "var(--hz-orange)",
  "var(--hz-sun)",
  "var(--hz-mint)",
  "var(--hz-sky)",
  "var(--hz-orange)",
  "var(--hz-sun)",
];

export default function LikeButton({
  liked,
  count,
  onToggle,
  appearance = "wash",
  iconSize = 16,
}: LikeButtonProps) {
  // いいねした瞬間だけバーストを再生するためのキー（0 = 未再生）
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) setBurstKey((k) => k + 1);
    onToggle();
  };

  const isOutline = appearance === "outline";
  const activeColor = "var(--color-accent)";
  const idleColor = "var(--color-fg-muted)";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="tap-target"
      style={{
        display: "flex", alignItems: "center", gap: isOutline ? 5 : 4,
        cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 600,
        color: liked ? activeColor : idleColor,
        padding: isOutline ? "8px 14px" : "6px 12px",
        borderRadius: 100,
        border: isOutline ? "1.5px solid" : "1px solid transparent",
        borderColor: isOutline
          ? (liked ? "var(--color-accent)" : "var(--color-border)")
          : "transparent",
        background: isOutline
          ? (liked ? "var(--color-accent-light)" : "var(--color-surface)")
          : "var(--hz-orange-wash)",
        boxShadow: isOutline && liked ? "0 2px 8px rgba(255, 90, 31, 0.15)" : "none",
      }}
    >
      <span style={{ position: "relative", display: "flex" }}>
        {burstKey > 0 && liked && (
          <span key={burstKey} aria-hidden style={{ position: "absolute", inset: 0 }}>
            {BURST_COLORS.map((c, i) => (
              <span
                key={i}
                className="burst-dot"
                style={{
                  background: c,
                  ["--a" as string]: `${i * 60}deg`,
                }}
              />
            ))}
          </span>
        )}
        <span key={liked ? "on" : "off"} className={liked ? "heart-pop" : undefined} style={{ display: "flex" }}>
          <Icon
            name={liked ? "heart-fill" : "heart"}
            size={iconSize}
            color={liked ? activeColor : idleColor}
          />
        </span>
      </span>
      <span key={count} className="animate-count-pop">{count}</span>
    </button>
  );
}
