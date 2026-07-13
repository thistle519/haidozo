"use client";

import type { Post } from "@/types";
import Avatar from "@/components/ui/Avatar";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";
import LikeButton from "@/components/ui/LikeButton";
import { useOgpImage } from "@/lib/useOgpImage";

interface PostDetailScreenProps {
  post: Post;
  posts: Post[];
  liked: boolean;
  onLike: (id: string) => void;
}

export default function PostDetailScreen({ post, posts, liked, onLike }: PostDetailScreenProps) {
  const related = posts.filter(
    (p) => p.id !== post.id && (p.relation === post.relation || p.scene === post.scene)
  ).slice(0, 3);
  const ogpImage = useOgpImage(post.url);

  return (
    <article style={{ paddingBottom: 100 }}>
      <div style={{
        height: 260,
        background: "linear-gradient(145deg, var(--hz-orange-wash), var(--hz-sun-tint))",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {ogpImage
          ? <img src={ogpImage} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : post.imageUrl
            ? <img src={post.imageUrl} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon name="gift" size={56} color="var(--color-accent)" strokeWidth={1.2} />
        }
        {(ogpImage || post.imageUrl) && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 50%, rgba(255,247,237,0.15) 100%)",
          }} />
        )}
      </div>

      {ogpImage && post.imageUrl && (
        <div style={{ padding: "12px 20px 0" }}>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(42, 37, 33, 0.08)",
          }}>
            <img src={post.imageUrl} alt={`${post.item} の写真`} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
          </div>
        </div>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        <div className="animate-pop-in" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Avatar initial={post.initial} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-fg)" }}>{post.user}</div>
            <div style={{ fontSize: 12, color: "var(--color-fg-subtle)" }}>{post.date}</div>
          </div>
          <LikeButton liked={liked} count={post.likes} onToggle={() => onLike(post.id)} appearance="outline" iconSize={15} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <PostTags post={post} />
        </div>

        <h1 style={{
          fontSize: 19, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.4, marginBottom: 14,
          letterSpacing: "-0.01em",
        }}>
          {post.item}
        </h1>

        {post.about && (
          <section className="stagger-item" style={{
            ["--stagger-i" as string]: 0,
            background: "var(--color-surface-alt)",
            borderRadius: 18, padding: "16px 18px", marginBottom: 12,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>贈った相手のこと</div>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.about}</div>
          </section>
        )}

        <section className="stagger-item" style={{
          ["--stagger-i" as string]: 1,
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderLeft: "3px solid var(--color-accent)",
          borderRadius: "0 18px 18px 0",
          padding: "16px 18px", marginBottom: 12,
          boxShadow: "0 2px 12px rgba(42, 37, 33, 0.04)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-accent)", letterSpacing: "0.05em", marginBottom: 8 }}>なぜこれを選んだか</div>
          <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.reason ?? post.note}</div>
        </section>

        {post.reaction && (
          <section className="stagger-item" style={{
            ["--stagger-i" as string]: 2,
            background: "linear-gradient(135deg, var(--hz-sun-tint), #FFF8E8)",
            borderRadius: 18, padding: "16px 18px", marginBottom: 12,
            boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.6)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B6F00", letterSpacing: "0.05em", marginBottom: 8 }}>贈った時のこと</div>
            <div style={{ fontSize: 14, color: "var(--color-fg)", lineHeight: 1.8 }}>{post.reaction}</div>
          </section>
        )}

        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-interactive"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "var(--color-surface)",
              borderRadius: 16, padding: "14px 16px", marginBottom: 20,
              textDecoration: "none",
              boxShadow: "0 2px 12px rgba(42, 37, 33, 0.05)",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-orange-tint))",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="external-link" size={16} color="var(--color-accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--color-fg-muted)", marginBottom: 2 }}>購入リンク</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>商品ページを見る</div>
            </div>
            <Icon name="arrow-right" size={16} color="var(--color-fg-subtle)" />
          </a>
        )}

        {related.length > 0 && (
          <section>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-fg-muted)", marginBottom: 12, letterSpacing: "0.04em" }}>似たプレゼント</div>
            {related.map((p) => (
              <div key={p.id} className="card-interactive" style={{
                background: "var(--color-surface)",
                borderRadius: 16, padding: "12px 14px", marginBottom: 10,
                boxShadow: "0 2px 12px rgba(42, 37, 33, 0.05)",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-sun-tint))",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon name="gift" size={16} color="var(--color-accent)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)", marginBottom: 4, lineHeight: 1.3 }}>{p.item}</div>
                  <PostTags post={p} small />
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </article>
  );
}
