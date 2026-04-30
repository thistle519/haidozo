"use client";

import type { Post } from "@/types";
import Avatar from "@/components/ui/Avatar";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";
import { FEED_DATA } from "@/lib/mockData";
import { useOgpImage } from "@/lib/useOgpImage";

interface PostDetailScreenProps {
  post: Post;
  liked: boolean;
  onLike: (id: number) => void;
}

export default function PostDetailScreen({ post, liked, onLike }: PostDetailScreenProps) {
  const related = FEED_DATA.filter(
    (p) => p.id !== post.id && (p.relation === post.relation || p.scene === post.scene)
  ).slice(0, 3);
  const ogpImage = useOgpImage(post.url);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{
        height: 260,
        background: "var(--color-accent-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {ogpImage
          ? <img src={ogpImage} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Icon name="gift" size={56} color="var(--color-accent)" strokeWidth={1.2} />
        }
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {/* user row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Avatar initial={post.initial} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-fg)" }}>{post.user}</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-subtle)" }}>{post.date}</div>
          </div>
          <button
            onClick={() => onLike(post.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 100, border: "1.5px solid",
              borderColor: liked ? "var(--color-accent)" : "var(--color-border)",
              background: liked ? "var(--color-accent-light)" : "var(--color-surface)",
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              color: liked ? "var(--color-accent)" : "var(--color-fg-muted)",
              transition: "all 200ms ease-out",
            }}
          >
            <Icon name={liked ? "heart-fill" : "heart"} size={15} color={liked ? "var(--color-accent)" : "var(--color-fg-muted)"} />
            {post.likes + (liked ? 1 : 0)}
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <PostTags post={post} />
        </div>

        <div style={{ fontSize: 19, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.4, marginBottom: 12 }}>
          {post.item}
        </div>

        {post.about && (
          <div style={{
            background: "var(--color-surface-alt)", border: "1px solid var(--color-border)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>贈った相手のこと</div>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.about}</div>
          </div>
        )}

        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: 16, padding: "14px 16px", marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-fg-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>なぜこれを選んだか</div>
          <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.reason ?? post.note}</div>
        </div>

        {post.reaction && (
          <div style={{
            background: "var(--color-sage-light)", border: "1px solid rgba(245,194,16,0.3)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8B6F00", letterSpacing: "0.05em", marginBottom: 8 }}>贈った時のこと</div>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.reaction}</div>
          </div>
        )}

        {post.url && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 20, cursor: "pointer",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "var(--color-accent-light)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="external-link" size={16} color="var(--color-accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--color-fg-muted)", marginBottom: 2 }}>購入リンク</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)" }}>商品ページを見る</div>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 12, letterSpacing: "0.04em" }}>似たプレゼント</div>
            {related.map((p) => (
              <div key={p.id} style={{
                background: "var(--color-surface)", border: "1px solid var(--color-border)",
                borderRadius: 14, padding: "12px 14px", marginBottom: 10,
                boxShadow: "var(--shadow-1)", display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "var(--color-surface-alt)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name="gift" size={16} color="var(--color-fg-subtle)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg)", marginBottom: 4, lineHeight: 1.3 }}>{p.item}</div>
                  <PostTags post={p} small />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
