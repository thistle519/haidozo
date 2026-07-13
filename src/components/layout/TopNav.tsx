"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "profile" | "notif";

interface TopNavProps {
  screen: Screen;
  onBack: () => void;
  onBell: () => void;
  hasNotif: boolean;
}

const titles: Partial<Record<Screen, string>> = {
  compose: "贈り物を記録する",
  detail: "プレゼントの詳細",
  notif: "通知",
};

export default function TopNav({ screen, onBack, onBell, hasNotif }: TopNavProps) {
  const isBack = ["compose", "detail", "notif"].includes(screen);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      background: "rgba(255,247,237,0.88)",
      backdropFilter: "blur(16px) saturate(1.4)",
      WebkitBackdropFilter: "blur(16px) saturate(1.4)",
      borderBottom: "1px solid rgba(239,230,217,0.6)",
      boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.5)",
      flexShrink: 0,
      zIndex: 9,
    }}>
      {isBack ? (
        <button
          onClick={onBack}
          className="tap-target"
          style={{
            cursor: "pointer", padding: 6, marginLeft: -6, borderRadius: 10,
            background: "none", border: "none", display: "flex",
          }}
        >
          <Icon name="arrow-left" size={22} color="var(--color-fg)" />
        </button>
      ) : (
        <div className="hover-wiggle" style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--color-fg)",
          letterSpacing: "-0.02em",
          cursor: "default",
        }}>
          haidozo
        </div>
      )}

      {isBack ? (
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-fg)", letterSpacing: "-0.01em" }}>
          {titles[screen] ?? ""}
        </div>
      ) : (
        <div />
      )}

      {isBack ? (
        <div style={{ width: 34 }} />
      ) : (
        <button
          onClick={onBell}
          className="tap-target"
          style={{
            cursor: "pointer", padding: 6, position: "relative",
            background: "none", border: "none", display: "flex",
            borderRadius: 10,
          }}
        >
          <span className={hasNotif ? "bell-ring" : undefined} style={{ display: "flex" }}>
            <Icon name="bell" size={22} color="var(--color-fg-muted)" />
          </span>
          {hasNotif && (
            <div style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: 100,
              background: "var(--color-accent)",
              border: "1.5px solid var(--color-bg)",
              boxShadow: "0 0 0 2px rgba(255, 90, 31, 0.2)",
            }} />
          )}
        </button>
      )}
    </nav>
  );
}
