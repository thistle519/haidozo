"use client";

import Icon from "@/components/ui/Icon";

type Screen = "feed" | "search" | "compose" | "detail" | "likes" | "profile" | "notif";

interface BottomNavProps {
  active: Screen;
  onNav: (screen: Screen) => void;
  likeCount: number;
}

const NAV_ITEMS = [
  { id: "feed" as Screen, label: "ホーム", icon: "home" as const },
  { id: "search" as Screen, label: "さがす", icon: "search" as const },
  { id: "compose" as Screen, label: "", icon: "plus" as const, isCenter: true },
  { id: "likes" as Screen, label: "きろく", icon: "heart" as const },
  { id: "profile" as Screen, label: "マイページ", icon: "user" as const },
];

export default function BottomNav({ active, onNav, likeCount }: BottomNavProps) {
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
      {NAV_ITEMS.map((item) =>
        item.isCenter ? (
          <div key={item.id} onClick={() => onNav(item.id)} style={{ cursor: "pointer" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 100,
              background: "var(--color-accent)",
              boxShadow: "0 4px 16px rgba(232,80,42,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="plus" size={24} color="#fff" />
            </div>
          </div>
        ) : (
          <div
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", padding: "4px 8px", borderRadius: 12, position: "relative",
            }}
          >
            <Icon
              name={item.icon}
              size={22}
              color={active === item.id ? "var(--color-accent)" : "var(--color-fg-muted)"}
            />
            {item.id === "likes" && likeCount > 0 && (
              <div style={{
                position: "absolute", top: 0, right: 2,
                width: 14, height: 14, borderRadius: 100,
                background: "var(--color-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",
              }}>
                {likeCount > 9 ? "9+" : likeCount}
              </div>
            )}
            <span style={{
              fontSize: 10, fontWeight: 500,
              color: active === item.id ? "var(--color-accent)" : "var(--color-fg-muted)",
            }}>
              {item.label}
            </span>
          </div>
        )
      )}
    </div>
  );
}
