import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("\n") || value.includes("\r")) return "/dashboard";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/sign-in?error=oauth_callback_failed", url.origin));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?error=oauth_callback_failed", url.origin));
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.redirect(new URL("/sign-in?error=profile_init_failed", url.origin));
  try {
    await ensureProfileForUser(createServiceClient(), userData.user);
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=profile_init_failed", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
