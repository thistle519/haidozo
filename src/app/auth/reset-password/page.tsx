"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setEmailError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("メールアドレスを入力してください");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("メールアドレスの形式が正しくありません");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
    });
    setLoading(false);

    if (error) {
      setGlobalError("送信に失敗しました。もう一度お試しください");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 100,
              background: "var(--color-accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-fg)",
            }}
          >
            メールを送りました
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-fg-muted)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-fg)" }}>{email}</strong>{" "}
            にパスワード再設定用のリンクを送りました。
          </p>
          <p style={{ fontSize: 12, color: "var(--color-fg-subtle)", lineHeight: 1.5 }}>
            メールが届かない場合は迷惑メールフォルダをご確認ください
          </p>
          <Link
            href="/auth/login"
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "var(--color-accent)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ログインページへ戻る
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "var(--color-fg)",
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        パスワードを忘れた
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-fg-muted)",
          marginBottom: 28,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        登録済みのメールアドレスを入力してください。
        再設定用リンクをお送りします。
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <AuthInput
          id="email"
          label="メールアドレス"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={emailError}
          autoComplete="email"
          disabled={loading}
        />

        {globalError && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: "#DC2626",
              fontWeight: 500,
            }}
          >
            {globalError}
          </div>
        )}

        <AuthButton type="submit" loading={loading} disabled={loading}>
          再設定メールを送る
        </AuthButton>
      </form>

      <div
        style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          fontSize: 13,
          color: "var(--color-fg-muted)",
        }}
      >
        <Link
          href="/auth/login"
          style={{
            color: "var(--color-accent)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ログインページへ戻る
        </Link>
      </div>
    </AuthCard>
  );
}
