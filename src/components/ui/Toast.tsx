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
      className={exiting ? "animate-fade-out" : "animate-toast-pop"}
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
        borderRadius: 18,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 12px 40px rgba(42, 37, 33, 0.25), 0 4px 12px rgba(42, 37, 33, 0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="animate-stamp-in" style={{
        width: 26, height: 26, borderRadius: 100,
        background: "linear-gradient(135deg, var(--hz-sun-tint), var(--hz-sun))",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 6px rgba(255, 194, 61, 0.3)",
      }}>
        <Icon name="check" size={14} color="#8B6F00" />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{message}</span>
    </div>
  );
}
