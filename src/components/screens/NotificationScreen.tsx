"use client";

import { useEffect, useState } from "react";
import type { Notification } from "@/types";
import { fetchNotifications, markNotificationsRead } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";

interface NotificationScreenProps {
  /** 既読化後に親へ通知（バッジを消すため） */
  onRead?: () => void;
}

export default function NotificationScreen({ onRead }: NotificationScreenProps) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchNotifications()
      .then((list) => {
        if (!active) return;
        setItems(list);
        setError(null);
        // 表示できたら既読化（失敗は無視）
        markNotificationsRead()
          .then(() => {
            if (active) onRead?.();
          })
          .catch(() => {});
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "通知の読み込みに失敗しました");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onRead]);

  if (loading) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 32,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: "3px solid var(--color-border)",
          borderTopColor: "var(--color-accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>読み込んでいます…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center",
      }}>
        <div style={{ fontSize: 14, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>{error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12, padding: 48, textAlign: "center",
      }}>
        <Icon name="bell" size={40} color="var(--color-fg-subtle)" strokeWidth={1.3} />
        <div style={{ fontSize: 14, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
          まだ通知はありません
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 100px" }}>
      {items.map((n) => (
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
              <span style={{ fontWeight: 600 }}>{n.user}</span> さんがあなたの投稿にいいねしました
            </div>
            {n.sub && (
              <div style={{
                fontSize: 12, color: "var(--color-fg-muted)", marginTop: 2, lineHeight: 1.4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{n.sub}</div>
            )}
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)", marginTop: 4 }}>{n.time}</div>
          </div>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "var(--color-surface-alt)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="gift" size={14} color="var(--color-fg-subtle)" />
          </div>
        </div>
      ))}
    </div>
  );
}
