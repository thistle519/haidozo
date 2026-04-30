"use client";

import { useState, useCallback } from "react";
import type { Post } from "@/types";
import { FEED_DATA } from "@/lib/mockData";

import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import Toast from "@/components/ui/Toast";

import FeedScreen from "@/components/screens/FeedScreen";
import SearchScreen from "@/components/screens/SearchScreen";
import ComposerScreen from "@/components/screens/ComposerScreen";
import PostDetailScreen from "@/components/screens/PostDetailScreen";
import LikesScreen from "@/components/screens/LikesScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import NotificationScreen from "@/components/screens/NotificationScreen";

type Screen = "feed" | "search" | "compose" | "detail" | "likes" | "profile" | "notif";

export default function ClientShell() {
  const [screen, setScreen] = useState<Screen>("search");
  const [prevScreen, setPrev] = useState<Screen>("search");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [notifSeen, setNotifSeen] = useState(false);

  const navigate = useCallback((s: Screen) => {
    setPrev(screen);
    setScreen(s);
  }, [screen]);

  const goBack = useCallback(() => {
    setScreen(prevScreen === "compose" ? "search" : prevScreen);
  }, [prevScreen]);

  const onLike = useCallback((id: number) => {
    setLikes((l) => ({ ...l, [id]: !l[id] }));
  }, []);

  const onTapPost = useCallback((post: Post) => {
    setSelectedPost(post);
    navigate("detail");
  }, [navigate]);

  const onBell = useCallback(() => {
    setNotifSeen(true);
    navigate("notif");
  }, [navigate]);

  const onPost = useCallback(() => {
    setTimeout(() => {
      navigate("search");
      setToast("投稿しました！みんなに届きます");
    }, 400);
  }, [navigate]);

  const likeCount = Object.values(likes).filter(Boolean).length;
  const showBottomNav = !["compose", "detail", "notif"].includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case "feed":
        return <FeedScreen posts={FEED_DATA} likes={likes} onLike={onLike} onTapPost={onTapPost} />;
      case "search":
        return <SearchScreen likes={likes} onTapPost={onTapPost} />;
      case "compose":
        return <ComposerScreen onPost={onPost} />;
      case "detail":
        return selectedPost ? (
          <PostDetailScreen post={selectedPost} liked={!!likes[selectedPost.id]} onLike={onLike} />
        ) : null;
      case "likes":
        return <LikesScreen likes={likes} onTapPost={onTapPost} />;
      case "profile":
        return <ProfileScreen likes={likes} onTapPost={onTapPost} />;
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
        ? <BottomNav active={screen} onNav={navigate} likeCount={likeCount} />
        : <div style={{ height: 72, background: "var(--color-bg)" }} />
      }
    </div>
  );
}
