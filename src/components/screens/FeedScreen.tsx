"use client";

import type { Post } from "@/types";
import Avatar from "@/components/ui/Avatar";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

interface FeedScreenProps {
  posts: Post[];
  likes: Record<number, boolean>;
  onLike: (id: number) => void;
  onTapPost: (post: Post) => void;
}

function FeedCard({ post, liked, onLike, onTap }: { post: Post; liked: boolean; onLike: (id: number) => void; onTap: (post: Post) => void }) {
  return (
    <div
      onClick={() => onTap(post)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 20,
        marginBottom: 16,
        overflow: "hidden",
        boxShadow: "var(--shadow-1)",
        cursor: "pointer",
      }}
    >
      <div style={{
        height: 160,
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="gift" size={42} color="var(--color-fg-subtle)" strokeWidth={1.4} />
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Avatar initial={post.initial} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>{post.user}</div>
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>{post.date}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              color: liked ? "var(--color-accent)" : "var(--color-fg-muted)",
              transition: "color 200ms ease-out", padding: 4,
            }}
          >
            <Icon name={liked ? "heart-fill" : "heart"} size={16} color={liked ? "var(--color-accent)" : "var(--color-fg-muted)"} />
            {post.likes + (liked ? 1 : 0)}
          </button>
        </div>
        <div style={{ marginBottom: 10 }}>
          <PostTags post={post} small />
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-fg)", marginBottom: 6, lineHeight: 1.4 }}>{post.item}</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>{post.note}</div>
      </div>
    </div>
  );
}

export default function FeedScreen({ posts, likes, onLike, onTapPost }: FeedScreenProps) {
  return (
    <div style={{ padding: "16px 20px 100px" }}>
      {posts.map((p) => (
        <FeedCard key={p.id} post={p} liked={!!likes[p.id]} onLike={onLike} onTap={onTapPost} />
      ))}
    </div>
  );
}
