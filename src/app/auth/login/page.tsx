"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "email" | "password";
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
        setGlobalError("メールアドレスまたはパスワードが違います");
      } else if (msg.includes("email not confirmed")) {
        setGlobalError("メールアドレスの確認が完了していません");
      } else if (msg.includes("too many requests")) {
        setGlobalError("しばらく時間をおいてから再度お試しください");
      } else {
        setGlobalError("ログインに失敗しました。もう一度お試しください");
      }
      return;
    }

    // オープンリダイレクト防止: "/" 始まりかつ "//" でない内部パスのみ許可
    const rawNext = searchParams.get("next") ?? "/";
    const next =
      rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
    router.push(next);
    router.refresh();
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
        おかえりなさい
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-fg-muted)",
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        はい、どうぞの記録を続けよう
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
          placeholder="••••••••"
          error={fieldErrors.password}
          autoComplete="current-password"
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

        <div style={{ textAlign: "right", marginTop: -8 }}>
          <Link
            href="/auth/reset-password"
            style={{
              fontSize: 12,
              color: "var(--color-fg-muted)",
              textDecoration: "none",
            }}
          >
            パスワードを忘れた方
          </Link>
        </div>

        <AuthButton type="submit" loading={loading} disabled={loading}>
          ログイン
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
        はじめての方は{" "}
        <Link
          href="/auth/signup"
          style={{
            color: "var(--color-accent)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          新規登録
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
