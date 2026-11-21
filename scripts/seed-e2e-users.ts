import { createClient } from "@supabase/supabase-js";

const DEV_REF = "jwhyesglviptvklrclll";
const PRODUCTION_REF = "bdeuecrwqrnlwhxwbpmi";

if (process.env.NODE_ENV === "production") throw new Error("REFUSED: e2e seed cannot run with NODE_ENV=production.");
if (process.env.SUPABASE_PROJECT_REF !== DEV_REF) throw new Error(`REFUSED: e2e seed requires Supabase dev ref ${DEV_REF}.`);
if (process.env.SUPABASE_PROJECT_REF === PRODUCTION_REF) throw new Error("REFUSED: production Supabase ref.");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

const users = [
  ["student", "e2e-student@sficusat.test", "E2E Student", null],
  ["moderator", "e2e-moderator@sficusat.test", "E2E Moderator", "moderator"],
  ["aashraya", "e2e-aashraya@sficusat.test", "E2E Aashraya", "aashraya_coordinator"],
  ["sahayi", "e2e-sahayi@sficusat.test", "E2E Sahayi", "sahayi_coordinator"],
  ["admin", "e2e-admin@sficusat.test", "E2E Admin", "admin"],
] as const;

for (const [name, email, fullName, role] of users) {
  const password = process.env[`E2E_PASSWORD_${name.toUpperCase()}`];
  if (!password) throw new Error(`Missing E2E_PASSWORD_${name.toUpperCase()}`);
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing.users.find((u) => u.email?.toLowerCase() === email);
  const result = found
    ? await admin.auth.admin.updateUserById(found.id, { password, email_confirm: true, user_metadata: { full_name: fullName } })
    : await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName } });
  if (result.error) throw result.error;
  const userId = result.data.user?.id;
  if (!userId) throw new Error(`No user id for ${name}`);
  if (role) {
    const { error } = await admin.from("user_roles").upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (error) throw error;
  }
}
console.log("E2E users seeded in DEV only.");
