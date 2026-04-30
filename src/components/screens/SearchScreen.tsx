"use client";

import { useState } from "react";
import type { Post, Relation, PriceRange } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import TagChip from "@/components/ui/TagChip";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "上司", "同僚", "先生・恩師"];
const PRICES: PriceRange[] = ["〜3,000円", "〜5,000円", "〜10,000円", "それ以上"];

interface SearchScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function SearchScreen({ likes, onTapPost }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [selRelation, setRelation] = useState<Relation | null>(null);
  const [selPrice, setPrice] = useState<PriceRange | null>(null);

  const results = FEED_DATA.filter((p) =>
    (!selRelation || p.relation === selRelation) &&
    (!selPrice || p.price === selPrice) &&
    (!query || p.item.includes(query) || p.reason?.includes(query) || p.about?.includes(query))
  );

  return (
    <div style={{ padding: "16px 20px 100px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--color-surface)", border: "1.5px solid var(--color-border)",
        borderRadius: 100, padding: "10px 16px", marginBottom: 20,
      }}>
        <Icon name="search" size={18} color="var(--color-fg-muted)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ギフトを検索..."
          style={{
            border: "none", outline: "none", background: "transparent",
            fontSize: 15, fontWeight: 500, color: "var(--color-fg)", flex: 1,
            fontFamily: "inherit",
          }}
        />
        {query && (
          <div onClick={() => setQuery("")} style={{ cursor: "pointer", color: "var(--color-fg-subtle)", fontSize: 13 }}>✕</div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-fg-muted)", marginBottom: 10 }}>関係性</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RELATIONS.map((r) => (
            <TagChip key={r} label={r} selected={selRelation === r} onClick={() => setRelation(selRelation === r ? null : r)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-fg-muted)", marginBottom: 10 }}>価格帯</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRICES.map((p) => (
            <TagChip key={p} label={p} selected={selPrice === p} onClick={() => setPrice(selPrice === p ? null : p)} />
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 12 }}>{results.length}件のギフト</div>
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-fg-subtle)", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>見つかりませんでした</div>
            <div style={{ fontSize: 12 }}>フィルターを変えてみてください</div>
          </div>
        ) : results.map((p) => (
          <div
            key={p.id}
            onClick={() => onTapPost(p)}
            style={{
              background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: 16, padding: "14px 16px", marginBottom: 12,
              boxShadow: "var(--shadow-1)", cursor: "pointer",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "var(--color-surface-alt)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon name="gift" size={18} color="var(--color-fg-subtle)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 7 }}><PostTags post={p} small /></div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-fg)", marginBottom: 4, lineHeight: 1.3 }}>{p.item}</div>
              <div style={{
                fontSize: 12, color: "var(--color-fg-muted)", lineHeight: 1.6,
                overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              } as React.CSSProperties}>{p.reason ?? p.note}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-fg-subtle)", fontSize: 12, flexShrink: 0, paddingTop: 2 }}>
              <Icon name="heart" size={12} color="var(--color-fg-subtle)" />
              {p.likes + (likes[p.id] ? 1 : 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
