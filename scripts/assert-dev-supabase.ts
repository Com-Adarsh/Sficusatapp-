const PROTECTED_REFS = new Set([
  "jwhyesglviptvklrclll",
  "uzfgyojiiqasohlozsyx",
]);

export function assertDevSupabaseTarget(
  projectRef = process.env.SUPABASE_PROJECT_REF,
  allowedDevRef = process.env.ALLOWED_DEV_REF,
) {
  if (!allowedDevRef) {
    throw new Error("REFUSED: ALLOWED_DEV_REF is unset. Set it explicitly to the intended DEV Supabase project before running this script.");
  }
  if (PROTECTED_REFS.has(allowedDevRef)) {
    throw new Error(`REFUSED: ALLOWED_DEV_REF ${allowedDevRef} is explicitly blocked.`);
  }
  if (PROTECTED_REFS.has(projectRef ?? "")) {
    throw new Error(`REFUSED: Supabase project ref ${projectRef} is explicitly blocked.`);
  }
  if (projectRef !== allowedDevRef) {
    throw new Error(`REFUSED: Supabase project ref ${projectRef ?? "<missing>"} is not the explicitly allowlisted ALLOWED_DEV_REF ${allowedDevRef}.`);
  }
}
