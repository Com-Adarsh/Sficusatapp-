import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureProfile(
  client: Pick<SupabaseClient, "from">,
  input: { id: string; fullName?: string | null },
) {
  const profile = await client.from("profiles").upsert(
    { id: input.id, full_name: input.fullName?.trim() || "CUSAT Student" },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (profile.error) throw profile.error;

  const role = await client.from("user_roles").upsert(
    { user_id: input.id, role: "student" },
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );
  if (role.error) throw role.error;

  return { profile: true, studentRole: true };
}
