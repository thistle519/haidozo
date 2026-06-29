"use client";

import type { Post } from "@/types";
import Avatar from "@/components/ui/Avatar";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";
import { useOgpImage } from "@/lib/useOgpImage";

interface FeedScreenProps {
  posts: Post[];
  likes: Record<string, boolean>;
  onLike: (id: string) => void;
  onTapPost: (post: Post) => void;
}

function FeatureCard({ post, liked, onLike, onTap }: { post: Post; liked: boolean; onLike: (id: string) => void; onTap: (post: Post) => void }) {
  const image = useOgpImage(post.url);
  return (
    <article
      onClick={() => onTap(post)}
      className="card-interactive"
      style={{
        background: "var(--color-surface)",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "var(--hz-shadow-soft)",
        cursor: "pointer",
        marginBottom: 28,
      }}
    >
      <div style={{
        height: 210,
        background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-sun-tint))",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}>
        {image
          ? <img src={image} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Icon name="gift" size={48} color="var(--color-accent)" strokeWidth={1.2} />
        }
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ marginBottom: 10 }}><PostTags post={post} small /></div>
        <div style={{
          fontSize: 17, fontWeight: 800, color: "var(--color-fg)", lineHeight: 1.45, marginBottom: 10,
          letterSpacing: "-0.01em",
        }}>
          {post.item}
        </div>
        <div style={{
          fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.8, marginBottom: 14,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          &ldquo;{post.reason}&rdquo;
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initial={post.initial} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>{post.user}</div>
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>{post.date}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
            className="tap-target"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "var(--hz-orange-wash)",
              border: "1px solid transparent", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: liked ? "var(--color-accent)" : "var(--color-fg-muted)",
              padding: "6px 12px", borderRadius: 100,
            }}
          >
            <Icon name={liked ? "heart-fill" : "heart"} size={16} color={liked ? "var(--color-accent)" : "var(--color-fg-muted)"} />
            {post.likes}
          </button>
        </div>
      </div>
    </article>
  );
}

function RailCard({ post, onTap }: { post: Post; onTap: (post: Post) => void }) {
  const image = useOgpImage(post.url);
  return (
    <article
      onClick={() => onTap(post)}
      className="card-interactive"
      style={{
        flexShrink: 0, width: 150,
        background: "var(--color-surface)",
        borderRadius: 16, overflow: "hidden",
        boxShadow: "var(--hz-shadow-soft)",
        cursor: "pointer",
      }}
    >
      <div style={{
        height: 96,
        background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-sun-tint))",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {image
          ? <img src={image} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Icon name="gift" size={26} color="var(--color-accent)" strokeWidth={1.3} />
        }
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
          background: "var(--color-surface-alt)", color: "var(--color-fg-muted)",
        }}>{post.relation}</span>
        <div style={{
          fontSize: 12, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.45, marginTop: 7,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.item}
        </div>
      </div>
    </article>
  );
}

function RowCard({ post, liked, onTap }: { post: Post; liked: boolean; onTap: (post: Post) => void }) {
  const image = useOgpImage(post.url);
  return (
    <article
      onClick={() => onTap(post)}
      style={{
        display: "flex", gap: 12, alignItems: "center",
        padding: "14px 0", borderBottom: "1px solid var(--color-border)",
        cursor: "pointer",
        transition: "background 150ms ease",
      }}
    >
      <div style={{
        width: 58, height: 58, borderRadius: 14, flexShrink: 0,
        background: "linear-gradient(135deg, var(--hz-orange-wash), var(--hz-sun-tint))",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "var(--hz-shadow-soft)",
      }}>
        {image
          ? <img src={image} alt={post.item} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <Icon name="gift" size={20} color="var(--color-accent)" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-fg-subtle)", marginBottom: 3, letterSpacing: "0.02em" }}>
          {post.relation} · {post.scene} · {post.price}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "var(--color-fg)", lineHeight: 1.4, marginBottom: 3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.item}
        </div>
        <div style={{
          fontSize: 11, color: "var(--color-fg-muted)", lineHeight: 1.6,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>
          {post.reason}
        </div>
      </div>
      {liked && <Icon name="heart-fill" size={14} color="var(--color-accent)" />}
    </article>
  );
}

export default function FeedScreen({ posts, likes, onLike, onTapPost }: FeedScreenProps) {
  const feature = posts.find((p) => p.url) ?? posts[0];
  const railTheme = "誕生日";
  const rail = posts.filter((p) => p.id !== feature.id && p.scene === railTheme).slice(0, 8);
  const rest = posts.filter((p) => p.id !== feature.id && !rail.some((r) => r.id === p.id));

  return (
    <div style={{ padding: "20px 20px 110px" }}>
      <div style={{
        fontSize: 11, fontWeight: 800, color: "var(--color-accent)",
        letterSpacing: "0.06em", marginBottom: 10,
        textTransform: "uppercase" as const,
      }}>
        今日の「はい、どうぞ」
      </div>
      <FeatureCard post={feature} liked={!!likes[feature.id]} onLike={onLike} onTap={onTapPost} />

      {rail.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)", letterSpacing: "-0.01em" }}>{railTheme}の「なぜ選んだか」</div>
            <div style={{ fontSize: 11, color: "var(--color-fg-subtle)" }}>{rail.length}件</div>
          </div>
          <div style={{
            display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none",
            margin: "0 -20px 28px", padding: "0 20px 4px",
          }}>
            {rail.map((p) => <RailCard key={p.id} post={p} onTap={onTapPost} />)}
          </div>
        </>
      )}

      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-fg)", marginBottom: 4, letterSpacing: "-0.01em" }}>新着の記録</div>
      {rest.map((p) => (
        <RowCard key={p.id} post={p} liked={!!likes[p.id]} onTap={onTapPost} />
      ))}
    </div>
  );
}
