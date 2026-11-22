import "server-only";

type EnsureProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type ServiceClientLike = {
  from(table: string): {
    upsert(values: Record<string, unknown>, options?: { onConflict?: string }): Promise<{ error: { message: string } | null }>;
  };
};

export async function ensureProfileForUser(service: ServiceClientLike, user: EnsureProfileUser) {
  const metadata = user.user_metadata ?? {};
  const fullName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    (user.email ? user.email.split("@")[0] : "CUSAT Student");

  const profile = await service
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });

  if (profile.error) throw new Error(`Unable to ensure profile: ${profile.error.message}`);

  const role = await service
    .from("user_roles")
    .upsert({ user_id: user.id, role: "student" }, { onConflict: "user_id,role" });

  if (role.error) throw new Error(`Unable to ensure student role: ${role.error.message}`);
}
