"use client";

import { useState } from "react";
import type { Post } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

interface ProfileScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function ProfileScreen({ likes, onTapPost }: ProfileScreenProps) {
  const [tab, setTab] = useState<"posts" | "likes">("posts");
  const myPosts = FEED_DATA.filter((p) => p.user === "shizuru");
  const likedPosts = FEED_DATA.filter((p) => likes[p.id]);
  const items = tab === "posts" ? myPosts : likedPosts;

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ textAlign: "center", padding: "24px 20px 0" }}>
        <div style={{
          width: 76, height: 76, borderRadius: 100, background: "var(--color-accent-light)",
          border: "2.5px solid var(--color-accent)", margin: "0 auto 12px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, fontWeight: 800, color: "var(--color-accent)",
        }}>
          S
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-fg)", marginBottom: 3 }}>shizuru</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 20 }}>贈り物の記録</div>

        <div style={{
          display: "flex", justifyContent: "center",
          background: "var(--color-surface)", borderRadius: 20, padding: "16px 0",
          border: "1px solid var(--color-border)", marginBottom: 4,
        }}>
          {([{ n: myPosts.length, label: "投稿" }, { n: 7, label: "いいね" }, { n: 12, label: "フォロワー" }] as const).map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center",
              borderRight: i < 2 ? "1px solid var(--color-border)" : "none",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, margin: "14px 20px 0" }}>
          <button style={{
            flex: 1, padding: 10, borderRadius: 100,
            border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
            fontSize: 13, fontWeight: 600, color: "var(--color-fg)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "inherit",
          }}>
            <Icon name="edit" size={14} color="var(--color-fg)" />
            プロフィールを編集
          </button>
          <button style={{
            width: 40, height: 40, borderRadius: 100, flexShrink: 0,
            border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Icon name="settings" size={16} color="var(--color-fg-muted)" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "20px 0 0", padding: "0 20px", borderBottom: "1px solid var(--color-border)" }}>
        {(["posts", "likes"] as const).map((id) => (
          <div
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, textAlign: "center", paddingBottom: 10, cursor: "pointer",
              fontSize: 14, fontWeight: tab === id ? 600 : 500,
              color: tab === id ? "var(--color-accent)" : "var(--color-fg-muted)",
              borderBottom: `2px solid ${tab === id ? "var(--color-accent)" : "transparent"}`,
              transition: "all 200ms ease-out",
            }}
          >
            {id === "posts" ? "投稿" : "いいね"}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-fg-subtle)", fontSize: 13 }}>
            {tab === "likes" ? "まだいいねした投稿がありません" : "投稿がありません"}
          </div>
        ) : items.map((p) => (
          <div
            key={p.id}
            onClick={() => onTapPost(p)}
            style={{
              background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 16, padding: "14px 16px", marginBottom: 12,
              boxShadow: "var(--shadow-1)", cursor: "pointer",
            }}
          >
            <div style={{ marginBottom: 8 }}><PostTags post={p} small /></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-fg)", marginBottom: 4 }}>{p.item}</div>
            <div style={{
              fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.6,
              overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>{p.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
