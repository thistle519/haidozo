"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "likes" | "profile" | "notif";

interface BottomNavProps {
  active: Screen;
  onNav: (screen: Screen) => void;
  likeCount: number;
}

export default function BottomNav({ active, onNav }: BottomNavProps) {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      height: 72,
      background: "rgba(255,249,244,0.95)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      padding: "8px 0 16px",
      zIndex: 10,
    }}>
      {/* 探す */}
      <div
        onClick={() => onNav("search")}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "pointer", padding: "4px 16px", borderRadius: 12,
        }}
      >
        <Icon name="search" size={22} color={active === "search" ? "var(--color-accent)" : "var(--color-fg-muted)"} />
        <span style={{ fontSize: 10, fontWeight: 500, color: active === "search" ? "var(--color-accent)" : "var(--color-fg-muted)" }}>
          探す
        </span>
      </div>

      {/* 投稿（中央ボタン） */}
      <div onClick={() => onNav("compose")} style={{ cursor: "pointer" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 100,
          background: "var(--color-accent)",
          boxShadow: "0 4px 16px rgba(232,80,42,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="plus" size={24} color="#fff" />
        </div>
      </div>

      {/* マイページ */}
      <div
        onClick={() => onNav("profile")}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "pointer", padding: "4px 16px", borderRadius: 12,
        }}
      >
        <Icon name="user" size={22} color={active === "profile" ? "var(--color-accent)" : "var(--color-fg-muted)"} />
        <span style={{ fontSize: 10, fontWeight: 500, color: active === "profile" ? "var(--color-accent)" : "var(--color-fg-muted)" }}>
          マイページ
        </span>
      </div>
    </div>
  );
}
