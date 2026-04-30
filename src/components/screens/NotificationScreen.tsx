import { NOTIFICATIONS } from "@/lib/mockData";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";

export default function NotificationScreen() {
  return (
    <div style={{ padding: "16px 20px 100px" }}>
      {NOTIFICATIONS.map((n) => (
        <div
          key={n.id}
          style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: n.unread ? "14px 12px" : "14px 0",
            borderBottom: n.unread ? "none" : "1px solid var(--color-border)",
            background: n.unread ? "var(--color-accent-light)" : "transparent",
            borderRadius: n.unread ? 14 : 0,
            marginBottom: n.unread ? 4 : 0,
          }}
        >
          <Avatar initial={n.initial} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--color-fg)", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>{n.user}</span> さんが{n.text}
            </div>
            {n.sub && (
              <div style={{
                fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2, lineHeight: 1.4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{n.sub}</div>
            )}
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 4 }}>{n.time}</div>
          </div>
          {n.type === "like" && (
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: "var(--color-surface-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="gift" size={14} color="var(--color-fg-subtle)" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
