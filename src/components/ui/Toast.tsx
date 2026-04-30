"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 2200);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={exiting ? "animate-fade-out" : "animate-slide-up"}
      style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: 440,
        zIndex: 100,
        background: "var(--color-fg)",
        color: "#fff",
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "var(--shadow-3)",
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 100,
        background: "var(--color-sage-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name="check" size={14} color="#8B6F00" />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{message}</span>
    </div>
  );
}
