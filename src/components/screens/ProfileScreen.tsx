"use client";

import { useRef, useState } from "react";
import type { Post } from "@/types";
import { type CurrentUser, updateProfile, uploadAvatarImage } from "@/lib/api";
import PostTags from "@/components/ui/PostTags";
import Icon from "@/components/ui/Icon";

interface ProfileScreenProps {
  posts: Post[];
  likes: Record<string, boolean>;
  me: CurrentUser | null;
  onTapPost: (post: Post) => void;
  onCompose: () => void;
  onLogout: () => void;
  onUpdateMe: (me: CurrentUser) => void;
}

// きろく（旧likesタブ＋投稿）を統合したマイページ
export default function ProfileScreen({ posts, likes, me, onTapPost, onCompose, onLogout, onUpdateMe }: ProfileScreenProps) {
  const [tab, setTab] = useState<"posts" | "likes">("posts");
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // プロフィール編集 state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myPosts = me ? posts.filter((p) => p.userId === me.id) : [];
  const likedPosts = posts.filter((p) => likes[p.id]);
  const items = tab === "posts" ? myPosts : likedPosts;

  const openEdit = () => {
    if (!me) return;
    setEditName(me.name);
    setEditAvatarUrl(me.avatarUrl ?? null);
    setEditError(null);
    setEditing(true);
  };

  const closeEdit = () => {
    setEditing(false);
    setEditError(null);
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じファイル再選択を許可
    if (!file || !me) return;
    setEditError(null);
    setUploading(true);
    try {
      const url = await uploadAvatarImage(file, me.id);
      setEditAvatarUrl(url);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!me || saving || uploading) return;
    setEditError(null);
    setSaving(true);
    try {
      const updated = await updateProfile({ name: editName, avatarUrl: editAvatarUrl });
      onUpdateMe({ ...me, ...updated, avatarUrl: editAvatarUrl });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "プロフィールの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const previewInitial = editName.trim().charAt(0) || me?.initial || "?";

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ textAlign: "center", padding: "24px 20px 0" }}>
        {me?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={me.avatarUrl}
            alt=""
            style={{
              width: 76, height: 76, borderRadius: 100, objectFit: "cover",
              border: "2.5px solid var(--color-accent)", margin: "0 auto 12px",
              display: "block",
            }}
          />
        ) : (
          <div style={{
            width: 76, height: 76, borderRadius: 100, background: "var(--color-accent-light)",
            border: "2.5px solid var(--color-accent)", margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, fontWeight: 800, color: "var(--color-accent)",
          }}>
            {me?.initial ?? "?"}
          </div>
        )}
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-fg)", marginBottom: 3 }}>{me?.name ?? ""}</div>
        <div style={{ fontSize: 13, color: "var(--color-fg-muted)", marginBottom: 20 }}>贈り物の記録</div>

        <div style={{
          display: "flex", justifyContent: "center",
          background: "var(--color-surface)", borderRadius: 20, padding: "16px 0",
          border: "1px solid var(--color-border)", marginBottom: 4,
        }}>
          {([{ n: myPosts.length, label: "きろく" }, { n: likedPosts.length, label: "いいね" }] as const).map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center",
              borderRight: i < 1 ? "1px solid var(--color-border)" : "none",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-fg)" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "var(--color-fg-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, margin: "14px 20px 0" }}>
          <button
            onClick={openEdit}
            disabled={!me}
            style={{
              flex: 1, padding: 10, borderRadius: 100,
              border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
              fontSize: 13, fontWeight: 600, color: "var(--color-fg)",
              cursor: me ? "pointer" : "default", opacity: me ? 1 : 0.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "inherit",
            }}>
            <Icon name="edit" size={14} color="var(--color-fg)" />
            プロフィールを編集
          </button>
          <button
            onClick={() => setConfirmingLogout(true)}
            aria-label="ログアウト"
            style={{
              width: 40, height: 40, borderRadius: 100, flexShrink: 0,
              border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
            <Icon name="logout" size={16} color="var(--color-fg-muted)" />
          </button>
        </div>

        {editing && (
          <div style={{
            margin: "14px 20px 0", padding: "18px 16px",
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-fg)", marginBottom: 14 }}>プロフィールを編集</div>

            {/* アバタープレビュー＋画像選択 */}
            {editAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={editAvatarUrl}
                alt=""
                style={{
                  width: 72, height: 72, borderRadius: 100, objectFit: "cover",
                  border: "2px solid var(--color-accent)", margin: "0 auto 10px", display: "block",
                }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: 100, background: "var(--color-accent-light)",
                border: "2px solid var(--color-accent)", margin: "0 auto 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800, color: "var(--color-accent)",
              }}>
                {previewInitial}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickFile}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || saving}
              style={{
                padding: "7px 18px", borderRadius: 100, marginBottom: 16,
                border: "1.5px solid var(--color-border)", background: "transparent",
                fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)",
                cursor: uploading || saving ? "default" : "pointer", fontFamily: "inherit",
                opacity: uploading || saving ? 0.6 : 1,
              }}>
              {uploading ? "アップロード中…" : "アイコンを変更"}
            </button>

            {/* ニックネーム入力 */}
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <label
                htmlFor="profile-nickname"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 6 }}
              >
                ニックネーム
              </label>
              <input
                id="profile-nickname"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                placeholder="ニックネーム"
                disabled={saving}
                style={{
                  width: "100%", padding: "12px 14px", fontSize: 15,
                  fontFamily: "var(--font-sans)", background: saving ? "var(--color-surface-alt)" : "#fff",
                  border: "2px solid var(--color-border)", borderRadius: 16,
                  color: "var(--color-fg)", outline: "none", WebkitAppearance: "none",
                }}
              />
            </div>

            {editError && (
              <div style={{ fontSize: 12, color: "#E8502A", fontWeight: 500, marginBottom: 12, textAlign: "left" }}>
                {editError}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={onSave}
                disabled={saving || uploading}
                style={{
                  padding: "8px 24px", borderRadius: 100, border: "none",
                  background: "var(--color-accent)", color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: saving || uploading ? "default" : "pointer", fontFamily: "inherit",
                  opacity: saving || uploading ? 0.6 : 1,
                }}>
                {saving ? "保存中…" : "保存"}
              </button>
              <button
                onClick={closeEdit}
                disabled={saving}
                style={{
                  padding: "8px 24px", borderRadius: 100,
                  border: "1.5px solid var(--color-border)", background: "transparent",
                  fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)",
                  cursor: saving ? "default" : "pointer", fontFamily: "inherit",
                }}>
                キャンセル
              </button>
            </div>
          </div>
        )}

        {confirmingLogout && (
          <div style={{
            margin: "14px 20px 0", padding: "14px 16px",
            background: "var(--color-surface)", border: "1px solid var(--color-border)",
            borderRadius: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "var(--color-fg)", marginBottom: 10 }}>ログアウトしますか？</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={onLogout}
                style={{
                  padding: "8px 24px", borderRadius: 100, border: "none",
                  background: "var(--color-accent)", color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>
                ログアウト
              </button>
              <button
                onClick={() => setConfirmingLogout(false)}
                style={{
                  padding: "8px 24px", borderRadius: 100,
                  border: "1.5px solid var(--color-border)", background: "transparent",
                  fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                やめておく
              </button>
            </div>
          </div>
        )}
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
            {id === "posts" ? "きろく" : "いいね"}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        {/* きろく追加（小さい投稿動線） */}
        {tab === "posts" && (
          <button
            onClick={onCompose}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 14, marginBottom: 14,
              border: "1.5px dashed var(--color-fg-subtle)", background: "transparent",
              fontSize: 13, fontWeight: 600, color: "var(--color-fg-muted)",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Icon name="plus" size={14} color="var(--color-fg-muted)" />
            「はい、どうぞ」した記録を追加
          </button>
        )}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-fg-subtle)", fontSize: 13 }}>
            {tab === "likes" ? "まだいいねした投稿がありません" : "まだ記録がありません"}
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
            } as React.CSSProperties}>{p.reason ?? p.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
