"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validation";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { name: result.data.name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("user already exists")) {
        setGlobalError("このメールアドレスは登録済みです");
      } else if (msg.includes("weak password")) {
        setGlobalError("パスワードが弱すぎます。より複雑なパスワードをお試しください");
      } else if (msg.includes("invalid email")) {
        setGlobalError("メールアドレスの形式が正しくありません");
      } else {
        setGlobalError("登録に失敗しました。もう一度お試しください");
      }
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
            確認メールを送りました
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-fg-muted)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-fg)" }}>{email}</strong> に確認メールを送りました。
            メール内のリンクをクリックして登録を完了してください。
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
            ログインページへ
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
        はじめまして！
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-fg-muted)",
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        あなたの「はい、どうぞ」を記録しよう
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <AuthInput
          id="name"
          label="ニックネーム"
          type="text"
          value={name}
          onChange={setName}
          placeholder="あざみ"
          error={fieldErrors.name}
          autoComplete="nickname"
          disabled={loading}
        />
        <AuthInput
          id="email"
          label="メールアドレス"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={fieldErrors.email}
          autoComplete="email"
          disabled={loading}
        />
        <AuthInput
          id="password"
          label="パスワード"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8文字以上"
          error={fieldErrors.password}
          autoComplete="new-password"
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
          アカウントを作成
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
        すでにアカウントをお持ちの方は{" "}
        <Link
          href="/auth/login"
          style={{
            color: "var(--color-accent)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ログイン
        </Link>
      </div>
    </AuthCard>
  );
}
