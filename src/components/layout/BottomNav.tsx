"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "profile" | "notif";

interface BottomNavProps {
  active: Screen;
  onNav: (screen: Screen) => void;
}

export default function BottomNav({ active, onNav }: BottomNavProps) {
  const sideTab = (id: Screen, icon: "home" | "user", label: string) => {
    const isActive = active === id;
    return (
      <button
        type="button"
        onClick={() => onNav(id)}
        className="tap-target"
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "pointer", padding: "4px 20px", borderRadius: 12, width: 96,
          background: "none", border: "none", fontFamily: "inherit",
        }}
      >
        <div style={{
          transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isActive ? "scale(1.1)" : "scale(1)",
        }}>
          <Icon name={icon} size={22} color={isActive ? "var(--color-accent)" : "var(--color-fg-muted)"} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: isActive ? 700 : 500,
          color: isActive ? "var(--color-accent)" : "var(--color-fg-muted)",
          transition: "color 200ms ease, font-weight 200ms ease",
        }}>
          {label}
        </span>
      </button>
    );
  };

  const isSearchActive = active === "search";

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      height: 72,
      background: "rgba(255,247,237,0.92)",
      backdropFilter: "blur(16px) saturate(1.4)",
      WebkitBackdropFilter: "blur(16px) saturate(1.4)",
      borderTop: "1px solid rgba(239,230,217,0.6)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 -4px 20px rgba(42, 37, 33, 0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px 14px",
      zIndex: 10,
    }}>
      {sideTab("feed", "home", "フィード")}

      <button
        type="button"
        onClick={() => onNav("search")}
        className="btn-interactive"
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "pointer", marginTop: -22,
          background: "none", border: "none", fontFamily: "inherit",
        }}
      >
        <div style={{
          width: 54, height: 54, borderRadius: 100,
          background: "linear-gradient(145deg, #FF6B35, var(--color-accent))",
          boxShadow: isSearchActive
            ? "0 6px 20px rgba(255, 90, 31, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)"
            : "0 4px 14px rgba(255, 90, 31, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          border: "3px solid var(--color-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "box-shadow 250ms ease, transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isSearchActive ? "scale(1.05)" : "scale(1)",
        }}>
          <Icon name="search" size={24} color="#fff" strokeWidth={2.2} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: isSearchActive ? "var(--color-accent)" : "var(--color-fg-muted)",
          transition: "color 200ms ease",
        }}>
          なにあげよ？
        </span>
      </button>

      {sideTab("profile", "user", "マイページ")}
    </nav>
  );
}
