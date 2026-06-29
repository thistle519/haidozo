import type { Post } from "@/types";

interface PostTagsProps {
  post: Post;
  small?: boolean;
}

type TagTone = "relation" | "scene" | "price" | "interest";

const TONE_STYLES: Record<TagTone, { background: string; color: string }> = {
  relation: {
    background: "var(--hz-orange-tint)",
    color: "var(--hz-orange-press)",
  },
  scene: {
    background: "var(--hz-sky-tint)",
    color: "var(--hz-sky)",
  },
  price: {
    background: "var(--hz-sun-tint)",
    color: "color-mix(in srgb, var(--hz-sun) 62%, var(--hz-ink))",
  },
  interest: {
    background: "var(--hz-mint-tint)",
    color: "color-mix(in srgb, var(--hz-mint) 56%, var(--hz-ink))",
  },
};

function normalizeFutureTags(post: Post): string[] {
  const futurePost = post as Post & {
    hobby?: string | string[];
    hobbies?: string[];
    interest?: string | string[];
    interests?: string[];
  };
  const raw = [
    futurePost.hobby,
    futurePost.hobbies,
    futurePost.interest,
    futurePost.interests,
  ].flat();

  return raw.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

export default function PostTags({ post, small = false }: PostTagsProps) {
  const baseTags: Array<{ label: string; tone: TagTone }> = [
    { label: post.relation, tone: "relation" },
    { label: post.scene, tone: "scene" },
    { label: post.price, tone: "price" },
  ];
  const tags: Array<{ label: string; tone: TagTone }> = [
    ...baseTags,
    ...normalizeFutureTags(post).map((label) => ({ label, tone: "interest" as const })),
  ].filter(({ label }) => Boolean(label));

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {tags.map(({ label, tone }) => (
        <span
          key={`${tone}-${label}`}
          style={{
            fontSize: small ? 11 : 12,
            fontWeight: 700,
            padding: small ? "3px 10px" : "4px 12px",
            borderRadius: 100,
            border: "1px solid transparent",
            background: TONE_STYLES[tone].background,
            color: TONE_STYLES[tone].color,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
