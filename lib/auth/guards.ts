import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type AppRole = Database["public"]["Enums"]["user_role"];

function safeNextPath(pathname: string) {
  if (!pathname.startsWith("/") || pathname.startsWith("//") || pathname.includes("\\") || /[\r\n]/.test(pathname)) return "/dashboard";
  return pathname;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  return user;
}

export async function requireRole(allowed: AppRole | AppRole[], nextPath = "/dashboard") {
  const user = await requireUser(nextPath);
  const supabase = await createClient();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  for (const role of allowedRoles) {
    const { data, error } = await supabase.rpc("current_user_has_role", { required_role: role });
    if (!error && data === true) return { user, role };
  }
  redirect("/403");
}
