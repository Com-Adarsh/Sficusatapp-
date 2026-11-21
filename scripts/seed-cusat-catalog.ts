import { createClient } from "@supabase/supabase-js";
import { CUSAT_DEPARTMENTS, CUSAT_PROGRAMMES } from "../lib/cusat-catalog";

if (process.env.NODE_ENV === "production") {
  throw new Error("Catalogue seed is development-only and refuses to run in production.");
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

const departments = CUSAT_DEPARTMENTS.map((d) => ({ id: d.id, slug: d.id, name: d.name }));
const programmes = CUSAT_PROGRAMMES.map((p) => ({
  id: p.id,
  slug: p.id,
  department_id: p.departmentId,
  level: p.level,
  category: p.category,
  name: p.name.replace(/Five- Year/g, "Five-Year"),
  duration_years: p.durationYears,
}));

const main = async () => {
  const { error: departmentError } = await supabase.from("departments").upsert(departments, { onConflict: "id" });
  if (departmentError) throw departmentError;
  const { error: programmeError } = await supabase.from("programmes").upsert(programmes, { onConflict: "id" });
  if (programmeError) throw programmeError;
  console.log(`Seeded ${departments.length} departments and ${programmes.length} programmes.`);
};

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
