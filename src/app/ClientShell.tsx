"use client";

import { useState, useCallback, useEffect } from "react";
import type { Post, Plan } from "@/types";
import {
  fetchFeed,
  toggleLike as apiToggleLike,
  getCurrentUser,
  signOut,
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

// デモ用：考え中のプラン
const INITIAL_PLANS: Plan[] = [
  {
    id: 1,
    label: "お母さん",
    relation: "家族",
    scene: "誕生日",
    persona: ["お出かけ好き", "vlogger"],
    loves: ["vlog撮影", "お出かけ"],
    selectedIds: ["25"],
    vibes: ["出かける口実をあげたかった"],
    memo: "最近vlogを始めて楽しそう。ネタになるものもいいかも",
    wish: "",
    savedAt: "6月10日",
  },
];

export default function ClientShell() {
  const [screen, setScreen] = useState<Screen>("search");
  const [prevScreen, setPrev] = useState<Screen>("search");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [toast, setToast] = useState<string | null>(null);
  const [notifSeen, setNotifSeen] = useState(false);
  const [me, setMe] = useState<CurrentUser | null>(null);

  // ログイン中ユーザーの取得（プロフィール表示用）
  useEffect(() => {
    getCurrentUser()
      .then(setMe)
      .catch(() => setMe(null));
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

    apiToggleLike(id).catch((err) => {
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
    setNotifSeen(true);
    navigate("notif");
  }, [navigate]);

  const onPost = useCallback((newPost: Post) => {
    setPosts((ps) => [newPost, ...ps]);
    setTimeout(() => {
      navigate("search");
      setToast("記録しました！誰かの思いめぐりのヒントになります");
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
      alignItems: "center", justifyContent: "center", gap: 16, padding: 32,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid var(--color-border)",
        borderTopColor: "var(--color-accent)",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 14, color: "var(--color-fg-muted)" }}>読み込んでいます…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        return <ProfileScreen posts={posts} likes={likes} me={me} onTapPost={onTapPost} onCompose={() => navigate("compose")} onLogout={onLogout} />;
      case "notif":
        return <NotificationScreen />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100dvh",
      maxWidth: 480,
      margin: "0 auto",
      background: "var(--color-bg)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>
      <TopNav screen={screen} onBack={goBack} onBell={onBell} hasNotif={!notifSeen} />

      <div
        key={screen}
        className="animate-fade-in"
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
