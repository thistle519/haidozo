import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";

  // オープンリダイレクト防止: "/" 始まりかつ "//"（プロトコル相対URL）でないパスのみ許可
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("\\")
      ? rawNext
      : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
