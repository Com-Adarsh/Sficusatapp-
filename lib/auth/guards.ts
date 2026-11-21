import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type AppRole = Database["public"]["Enums"]["user_role"];

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getCurrentRoles(userId?: string): Promise<AppRole[]> {
  const supabase = await createClient();
  const user = userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!user) return [];
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", user);
  return (data ?? []).map((row) => row.role as AppRole);
}

export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireRole(allowed: AppRole | AppRole[], nextPath: string) {
  const user = await requireUser(nextPath);
  const roles = await getCurrentRoles(user.id);
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedRoles.some((role) => roles.includes(role))) redirect("/forbidden");
  return { user, roles };
}
