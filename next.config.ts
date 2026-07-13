import type { NextConfig } from "next";

/**
 * 全ルートに付与するセキュリティヘッダ。
 * - X-Content-Type-Options: MIME スニッフィング抑止
 * - Referrer-Policy: クロスオリジンへはオリジンのみ送信
 * - X-Frame-Options: クリックジャッキング対策（フレーム埋め込み禁止）
 * CSP は既存のインラインスタイルや Supabase Storage 画像を壊さないよう、
 * まずはヘッダ 3 種を導入。CSP 本適用は別途 report-only から段階導入する。
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
