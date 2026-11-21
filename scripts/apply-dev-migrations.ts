import { execFileSync } from "node:child_process";
import { assertDevSupabaseTarget } from "./assert-dev-supabase";

const projectRef = process.env.SUPABASE_PROJECT_REF;
assertDevSupabaseTarget(projectRef);

if (!process.env.SUPABASE_DB_URL) throw new Error("SUPABASE_DB_URL is required.");
if (process.env.NODE_ENV === "production") throw new Error("REFUSED: migration script cannot run with NODE_ENV=production.");

execFileSync("supabase", ["db", "push", "--db-url", process.env.SUPABASE_DB_URL], {
  stdio: "inherit",
  env: { ...process.env, SUPABASE_PROJECT_REF: projectRef },
});
