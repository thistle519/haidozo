"use client";

import { useState } from "react";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-fg-muted)",
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{
            width: "100%",
            padding: isPassword ? "12px 44px 12px 14px" : "12px 14px",
            fontSize: 15,
            fontFamily: "var(--font-sans)",
            background: disabled ? "var(--color-surface-alt)" : "#fff",
            border: `2px solid ${
              error
                ? "#E8502A"
                : focused
                ? "var(--color-accent)"
                : "var(--color-border)"
            }`,
            borderRadius: 16,
            color: "var(--color-fg)",
            outline: "none",
            transition: "border-color 200ms ease-out",
            WebkitAppearance: "none",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: "var(--color-fg-subtle)",
              display: "flex",
              alignItems: "center",
            }}
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
          >
            {showPassword ? (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span
          style={{
            fontSize: 12,
            color: "#E8502A",
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
