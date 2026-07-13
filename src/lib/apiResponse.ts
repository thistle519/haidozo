import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/**
 * API レスポンス標準形
 * 成功: { data: T }
 * 失敗: { error: { code, message } }（message は日本語）
 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const unauthorized = () =>
  apiError(401, "unauthorized", "ログインが必要です");

export const forbidden = () =>
  apiError(403, "forbidden", "この操作を行う権限がありません");

export const notFound = () =>
  apiError(404, "not_found", "見つかりませんでした");

export const serverError = () =>
  apiError(500, "server_error", "問題が発生しました。もう一度試してみてください");

/**
 * レート制限超過（429）。retryAfter（秒）があれば Retry-After ヘッダを付ける。
 */
export function rateLimited(retryAfter?: number) {
  const res = apiError(
    429,
    "rate_limited",
    "アクセスが集中しています。少し時間をおいて試してみてください",
  );
  if (retryAfter && retryAfter > 0) {
    res.headers.set("Retry-After", String(retryAfter));
  }
  return res;
}

export function validationError(error: ZodError) {
  const first = error.issues[0];
  return apiError(400, "invalid_input", first?.message ?? "入力内容を確認してください");
}
