"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "profile" | "notif";

interface BottomNavProps {
  active: Screen;
  onNav: (screen: Screen) => void;
}

// 3タブ構成：フィード ｜ なにあげよ？（中央・メイン動線）｜ マイページ（きろく統合）
export default function BottomNav({ active, onNav }: BottomNavProps) {
  const sideTab = (id: Screen, icon: "home" | "user", label: string) => (
    <div
      onClick={() => onNav(id)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        cursor: "pointer", padding: "4px 20px", borderRadius: 12, width: 96,
      }}
    >
      <Icon name={icon} size={22} color={active === id ? "var(--color-accent)" : "var(--color-fg-muted)"} />
      <span style={{ fontSize: 10, fontWeight: 500, color: active === id ? "var(--color-accent)" : "var(--color-fg-muted)" }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      height: 72,
      background: "rgba(255,247,237,0.95)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid var(--color-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px 14px",
      zIndex: 10,
    }}>
      {sideTab("feed", "home", "フィード")}

      {/* なにあげよ？（中央・メイン動線） */}
      <div
        onClick={() => onNav("search")}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "pointer", marginTop: -22,
        }}
      >
        <div style={{
          width: 54, height: 54, borderRadius: 100,
          background: "var(--color-accent)",
          boxShadow: "var(--hz-shadow-cta)",
          border: "3px solid var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="search" size={24} color="#fff" strokeWidth={2.2} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: active === "search" ? "var(--color-accent)" : "var(--color-fg-muted)",
        }}>
          なにあげよ？
        </span>
      </div>

      {sideTab("profile", "user", "マイページ")}
    </div>
  );
}
