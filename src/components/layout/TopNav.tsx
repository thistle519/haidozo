"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "likes" | "profile" | "notif";

interface TopNavProps {
  screen: Screen;
  onBack: () => void;
  onBell: () => void;
  hasNotif: boolean;
}

const titles: Partial<Record<Screen, string>> = {
  compose: "贈り物を記録する",
  detail: "ギフトの詳細",
  notif: "通知",
};

export default function TopNav({ screen, onBack, onBell, hasNotif }: TopNavProps) {
  const isBack = ["compose", "detail", "notif"].includes(screen);

  return (
    <div style={{
      position: "sticky",
      top: 0,
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      background: "rgba(250,247,242,0.92)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--color-border)",
      flexShrink: 0,
      zIndex: 9,
    }}>
      {isBack ? (
        <div onClick={onBack} style={{ cursor: "pointer", padding: 4, marginLeft: -4 }}>
          <Icon name="arrow-left" size={22} color="var(--color-fg)" />
        </div>
      ) : (
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-accent)", letterSpacing: "-0.5px" }}>
          haidozo
        </div>
      )}

      {isBack ? (
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-fg)" }}>
          {titles[screen] ?? ""}
        </div>
      ) : (
        <div />
      )}

      {isBack ? (
        <div style={{ width: 30 }} />
      ) : (
        <div onClick={onBell} style={{ cursor: "pointer", padding: 4, position: "relative" }}>
          <Icon name="bell" size={22} color="var(--color-fg-muted)" />
          {hasNotif && (
            <div style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: 100,
              background: "var(--color-accent)",
              border: "1.5px solid var(--color-bg)",
            }} />
          )}
        </div>
      )}
    </div>
  );
}
