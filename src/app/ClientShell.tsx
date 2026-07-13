"use client";

import { useState, useCallback, useEffect } from "react";
import type { Post, Plan } from "@/types";
import {
  fetchFeed,
  toggleLike as apiToggleLike,
  getCurrentUser,
  signOut,
  fetchNotifications,
  type CurrentUser,
} from "@/lib/api";

import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import Toast from "@/components/ui/Toast";

import FeedScreen from "@/components/screens/FeedScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import ComposerScreen from "@/components/screens/ComposerScreen";
import PostDetailScreen from "@/components/screens/PostDetailScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import NotificationScreen from "@/components/screens/NotificationScreen";

type Screen = "feed" | "search" | "compose" | "detail" | "profile" | "notif";

export default function ClientShell() {
  const [screen, setScreen] = useState<Screen>("search");
  const [prevScreen, setPrev] = useState<Screen>("search");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [me, setMe] = useState<CurrentUser | null>(null);

  // ログイン中ユーザーの取得（プロフィール表示用）
  useEffect(() => {
    getCurrentUser()
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  // 未読通知数の取得（バッジ表示用）
  useEffect(() => {
    fetchNotifications()
      .then((list) => setUnreadNotif(list.filter((n) => n.unread).length))
      .catch(() => setUnreadNotif(0));
  }, []);

  const onLogout = useCallback(() => {
    void signOut();
  }, []);

  // フィード取得状態
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // fetchFeed 実行。setState はすべて Promise コールバック内（＝effect 同期実行外）で行う
  const loadFeed = useCallback(() => {
    return fetchFeed()
      .then(({ posts: fetched, likedByMe }) => {
        setPosts(fetched);
        setLikes(likedByMe);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : "読み込みに失敗しました");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 再試行ボタン用（クリックハンドラからの同期 setState は問題ない）
  const retryLoad = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const navigate = useCallback((s: Screen) => {
    setPrev(screen);
    setScreen(s);
  }, [screen]);

  const goBack = useCallback(() => {
    setScreen(prevScreen === "compose" ? "search" : prevScreen);
  }, [prevScreen]);

  const onLike = useCallback((id: string) => {
    // 楽観更新
    const prevLiked = !!likes[id];
    setLikes((l) => ({ ...l, [id]: !prevLiked }));
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, likes: p.likes + (prevLiked ? -1 : 1) }
          : p
      )
    );
    // selectedPost も更新
    setSelectedPost((sp) => {
      if (!sp || sp.id !== id) return sp;
      return { ...sp, likes: sp.likes + (prevLiked ? -1 : 1) };
    });

    apiToggleLike(id)
      .then(({ liked, likes: serverLikes }) => {
        // サーバ値で収束（連打時の楽観更新ズレを補正）
        setLikes((l) => ({ ...l, [id]: liked }));
        setPosts((ps) =>
          ps.map((p) => (p.id === id ? { ...p, likes: serverLikes } : p))
        );
        setSelectedPost((sp) => {
          if (!sp || sp.id !== id) return sp;
          return { ...sp, likes: serverLikes };
        });
      })
      .catch((err) => {
        // ロールバック
        setLikes((l) => ({ ...l, [id]: prevLiked }));
        setPosts((ps) =>
          ps.map((p) =>
            p.id === id
              ? { ...p, likes: p.likes + (prevLiked ? 1 : -1) }
              : p
          )
        );
        setSelectedPost((sp) => {
          if (!sp || sp.id !== id) return sp;
          return { ...sp, likes: sp.likes + (prevLiked ? 1 : -1) };
        });
        setToast(err instanceof Error ? err.message : "いいねに失敗しました");
      });
  }, [likes]);

  const onTapPost = useCallback((post: Post) => {
    setSelectedPost(post);
    navigate("detail");
  }, [navigate]);

  const onBell = useCallback(() => {
    navigate("notif");
  }, [navigate]);

  // 通知画面で既読化したらバッジを消す
  const onNotifRead = useCallback(() => {
    setUnreadNotif(0);
  }, []);

  const onPost = useCallback((newPost: Post) => {
    setPosts((ps) => [newPost, ...ps]);
    setTimeout(() => {
      navigate("search");
      setToast("記録しました！誰かの「これどうかな？」のヒントになります");
    }, 400);
  }, [navigate]);

  const onSavePlan = useCallback((plan: Plan) => {
    setPlans((ps) => {
      const exists = ps.some((p) => p.id === plan.id);
      return exists ? ps.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...ps];
    });
    setToast("考え中に保存しました。いつでも続きから");
  }, []);

  const showBottomNav = !["compose", "detail", "notif"].includes(screen);

  // ── ローディング / エラー表示 ────────────────────────────────────────────

  const renderLoading = () => (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: "20px 20px 110px", gap: 16,
    }}>
      {/* Skeleton: section header */}
      <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 4 }} />
      {/* Skeleton: feature card */}
      <div style={{
        borderRadius: 22, overflow: "hidden",
        background: "var(--color-surface)",
        boxShadow: "0 4px 16px rgba(42, 37, 33, 0.05)",
      }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
        <div style={{ padding: "16px 18px 18px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 48, height: 20, borderRadius: 100 }} />
            <div className="skeleton" style={{ width: 56, height: 20, borderRadius: 100 }} />
          </div>
          <div className="skeleton" style={{ width: "80%", height: 18, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: "100%", height: 14, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 14 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 100 }} />
            <div className="skeleton" style={{ width: 80, height: 14 }} />
          </div>
        </div>
      </div>
      {/* Skeleton: section header */}
      <div className="skeleton" style={{ width: 160, height: 16, marginTop: 8 }} />
      {/* Skeleton: row cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0" }}>
          <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 14 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: "40%", height: 10, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "70%", height: 14, marginBottom: 6 }} />
            <div className="skeleton" style={{ width: "90%", height: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center",
    }}>
      <div style={{ fontSize: 14, color: "var(--color-fg-muted)", lineHeight: 1.7 }}>
        {loadError}
      </div>
      <button
        onClick={retryLoad}
        style={{
          padding: "12px 28px", borderRadius: 100, border: "none",
          background: "var(--color-accent)", color: "#fff",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(232,80,42,0.35)",
        }}
      >
        再試行
      </button>
    </div>
  );

  // ── 画面レンダリング ──────────────────────────────────────────────────────

  const renderScreen = () => {
    if (loading) return renderLoading();
    if (loadError) return renderError();

    switch (screen) {
      case "feed":
        return <FeedScreen posts={posts} likes={likes} onLike={onLike} onTapPost={onTapPost} />;
      case "search":
        return (
          <SearchScreen
            posts={posts}
            likes={likes}
            onTapPost={onTapPost}
            plans={plans}
            onSavePlan={onSavePlan}
            onCompose={() => navigate("compose")}
          />
        );
      case "compose":
        return <ComposerScreen onPost={onPost} />;
      case "detail":
        return selectedPost ? (
          <PostDetailScreen
            post={selectedPost}
            posts={posts}
            liked={!!likes[selectedPost.id]}
            onLike={onLike}
          />
        ) : null;
      case "profile":
        return <ProfileScreen posts={posts} likes={likes} me={me} onTapPost={onTapPost} onCompose={() => navigate("compose")} onLogout={onLogout} onUpdateMe={setMe} />;
      case "notif":
        return <NotificationScreen onRead={onNotifRead} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="noise-grain"
      style={{
        width: "100%",
        minHeight: "100dvh",
        maxWidth: 480,
        margin: "0 auto",
        background: "var(--color-bg)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav screen={screen} onBack={goBack} onBell={onBell} hasNotif={unreadNotif > 0} />

      <div
        key={screen}
        className="animate-screen-in"
        style={{ flex: 1, overflowX: "hidden", position: "relative" }}
      >
        {renderScreen()}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>

      {showBottomNav
        ? <BottomNav active={screen} onNav={navigate} />
        : <div style={{ height: 72, background: "var(--color-bg)" }} />
      }
    </div>
  );
}
