"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const errors: { password?: string; confirm?: string } = {};
    if (password.length < 8) {
      errors.password = "パスワードは8文字以上にしてください";
    }
    if (password.length > 72) {
      errors.password = "パスワードは72文字以内にしてください";
    }
    if (!confirm) {
      errors.confirm = "確認用パスワードを入力してください";
    } else if (password !== confirm) {
      errors.confirm = "パスワードが一致しません";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("same password")) {
        setGlobalError("現在と異なるパスワードを設定してください");
      } else if (msg.includes("weak password")) {
        setGlobalError("パスワードが弱すぎます。より複雑なパスワードをお試しください");
      } else {
        setGlobalError("パスワードの更新に失敗しました。もう一度お試しください");
      }
      return;
    }

    router.push("/");
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
        新しいパスワード
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-fg-muted)",
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        8文字以上のパスワードを設定してください
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <AuthInput
          id="password"
          label="新しいパスワード"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8文字以上"
          error={fieldErrors.password}
          autoComplete="new-password"
          disabled={loading}
        />
        <AuthInput
          id="confirm"
          label="パスワード（確認）"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="もう一度入力"
          error={fieldErrors.confirm}
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
          パスワードを更新する
        </AuthButton>
      </form>
    </AuthCard>
  );
}
