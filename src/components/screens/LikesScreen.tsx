"use client";

import type { Post } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

interface LikesScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function LikesScreen({ likes, onTapPost }: LikesScreenProps) {
  const likedPosts = FEED_DATA.filter((p) => likes[p.id]);

  if (likedPosts.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "60%", padding: "32px 40px", textAlign: "center", gap: 12,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 100, background: "var(--color-accent-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="heart" size={30} color="var(--color-accent)" strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-fg)" }}>まだいいねがありません</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.8 }}>
          気になったプレゼントにいいねすると<br />ここにまとめて表示されます
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px 100px" }}>
      <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 16 }}>
        {likedPosts.length}件のいいね
      </div>
      {likedPosts.map((p) => (
        <div
          key={p.id}
          onClick={() => onTapPost(p)}
          style={{
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 16, overflow: "hidden", marginBottom: 12,
            boxShadow: "var(--shadow-1)", cursor: "pointer", display: "flex",
          }}
        >
          <div style={{
            width: 80, background: "var(--color-surface-alt)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon name="gift" size={24} color="var(--color-fg-subtle)" />
          </div>
          <div style={{ flex: 1, padding: "12px 14px", minWidth: 0 }}>
            <div style={{ marginBottom: 7 }}><PostTags post={p} small /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)", lineHeight: 1.3, marginBottom: 4 }}>{p.item}</div>
            <div style={{
              fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.6,
              overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>{p.note}</div>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "0 14px", gap: 2,
          }}>
            <Icon name="heart-fill" size={16} color="var(--color-accent)" />
            <span style={{ fontSize: 11, color: "var(--color-accent)", fontWeight: 600 }}>{p.likes + 1}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
