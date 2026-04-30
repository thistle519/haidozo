"use client";

import { useState, useMemo } from "react";
import type { Post, Relation, PriceRange, Scene } from "@/types";
import { FEED_DATA } from "@/lib/mockData";
import { searchPosts } from "@/lib/searchUtils";
import TagChip from "@/components/ui/TagChip";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

const RELATIONS: Relation[] = ["恋人", "友達", "家族", "上司", "同僚", "先生・恩師"];
const SCENES: Scene[] = ["誕生日", "記念日", "お礼", "送別", "なんでもない日"];
const PRICES: PriceRange[] = ["〜3,000円", "〜5,000円", "〜10,000円", "それ以上"];

// 全投稿からペルソナタグを収集
const ALL_PERSONAS = [...new Set(FEED_DATA.flatMap((p) => p.persona ?? []))];

interface SearchScreenProps {
  likes: Record<number, boolean>;
  onTapPost: (post: Post) => void;
}

export default function SearchScreen({ likes, onTapPost }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [personaQuery, setPersonaQuery] = useState("");
  const [selPersona, setSelPersona] = useState<string | null>(null);
  const [selRelation, setSelRelation] = useState<Relation | null>(null);
  const [selScene, setSelScene] = useState<Scene | null>(null);
  const [selPrice, setSelPrice] = useState<PriceRange | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(
    () =>
      searchPosts(FEED_DATA, {
        query,
        personaQuery,
        relation: selRelation,
        scene: selScene,
        price: selPrice,
        persona: selPersona,
      }),
    [query, personaQuery, selRelation, selScene, selPrice, selPersona]
  );

  const hasFilter = selRelation || selScene || selPrice;
  const isFiltering = query || personaQuery || selPersona || hasFilter;

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      {/* メイン検索 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--color-surface)", border: "1.5px solid var(--color-border)",
        borderRadius: 100, padding: "11px 16px", marginBottom: 20,
      }}>
        <Icon name="search" size={18} color="var(--color-fg-muted)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="どんなギフトを探してる？"
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

      {/* どんな人？セクション */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 10, letterSpacing: "0.04em" }}>
          どんな人に贈る？
        </div>

        {/* ペルソナチップ */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
          {ALL_PERSONAS.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={selPersona === tag}
              onClick={() => setSelPersona(selPersona === tag ? null : tag)}
            />
          ))}
        </div>

        {/* 自由入力 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-surface)", border: "1.5px solid var(--color-border)",
          borderRadius: 100, padding: "8px 14px",
        }}>
          <input
            value={personaQuery}
            onChange={(e) => setPersonaQuery(e.target.value)}
            placeholder="自由に入力（例：おしゃれな人、甘いもの好き）"
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: "var(--color-fg)", flex: 1,
              fontFamily: "inherit",
            }}
          />
          {personaQuery && (
            <div onClick={() => setPersonaQuery("")} style={{ cursor: "pointer", color: "var(--color-fg-subtle)", fontSize: 12 }}>✕</div>
          )}
        </div>
      </div>

      {/* 絞り込み（折りたたみ） */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: hasFilter ? "var(--color-accent)" : "var(--color-fg-muted)",
            padding: 0, fontFamily: "inherit", letterSpacing: "0.04em",
          }}
        >
          <Icon name="filter" size={13} color={hasFilter ? "var(--color-accent)" : "var(--color-fg-muted)"} />
          絞り込む
          {hasFilter && <span style={{ fontSize: 11, background: "var(--color-accent)", color: "#fff", borderRadius: 100, padding: "1px 6px" }}>ON</span>}
          <span style={{ fontSize: 11, marginLeft: 2 }}>{filtersOpen ? "▲" : "▼"}</span>
        </button>

        {filtersOpen && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 8 }}>関係性</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {RELATIONS.map((r) => (
                  <TagChip key={r} label={r} selected={selRelation === r} onClick={() => setSelRelation(selRelation === r ? null : r)} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 8 }}>シーン</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {SCENES.map((s) => (
                  <TagChip key={s} label={s} selected={selScene === s} onClick={() => setSelScene(selScene === s ? null : s)} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)", marginBottom: 8 }}>価格帯</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {PRICES.map((p) => (
                  <TagChip key={p} label={p} selected={selPrice === p} onClick={() => setSelPrice(selPrice === p ? null : p)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 結果 */}
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
        {isFiltering && (
          <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 12 }}>
            {results.length}件のギフト
          </div>
        )}

        {!isFiltering ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-fg-subtle)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--color-fg-muted)" }}>
              贈る相手のことを入力してみて
            </div>
            <div style={{ fontSize: 12 }}>チップを選ぶか、自由に入力できます</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-fg-subtle)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, color: "var(--color-fg-muted)" }}>
              見つかりませんでした
            </div>
            <div style={{ fontSize: 12 }}>条件を変えてみてください</div>
          </div>
        ) : (
          results.map((p) => (
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
                } as React.CSSProperties}>{p.reason}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--color-fg-subtle)", fontSize: 12, flexShrink: 0, paddingTop: 2 }}>
                <Icon name="heart" size={12} color="var(--color-fg-subtle)" />
                {p.likes + (likes[p.id] ? 1 : 0)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
