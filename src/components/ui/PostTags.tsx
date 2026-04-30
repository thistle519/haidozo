import type { Post } from "@/types";

interface PostTagsProps {
  post: Post;
  small?: boolean;
}

export default function PostTags({ post, small = false }: PostTagsProps) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {[post.relation, post.scene, post.price].filter(Boolean).map((t) => (
        <span
          key={t}
          style={{
            fontSize: small ? 11 : 12,
            fontWeight: 500,
            padding: small ? "3px 10px" : "4px 12px",
            borderRadius: 100,
            background: "var(--color-accent-light)",
            color: "var(--color-accent-dark)",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
