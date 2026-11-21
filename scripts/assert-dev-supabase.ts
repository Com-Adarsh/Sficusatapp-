const BLOCKED_REFS = new Set([
  "bdeuecrwqrnlwhxwbpmi",
  "jwhyesglviptvklrclll",
]);

export function assertDevSupabaseTarget(
  projectRef = process.env.SUPABASE_PROJECT_REF,
  allowedDevRef = process.env.ALLOWED_DEV_REF,
) {
  if (!allowedDevRef) {
    throw new Error(
      "REFUSED: ALLOWED_DEV_REF is unset. Set it explicitly to the intended DEV Supabase project before running this script.",
    );
  }
  if (BLOCKED_REFS.has(allowedDevRef)) {
    throw new Error(`REFUSED: ALLOWED_DEV_REF ${allowedDevRef} is explicitly blocked.`);
  }
  if (BLOCKED_REFS.has(projectRef ?? "")) {
    throw new Error(`REFUSED: Supabase project ${projectRef} is explicitly blocked.`);
  }
  if (projectRef !== allowedDevRef) {
    throw new Error(`REFUSED: Supabase project ref ${projectRef ?? "<missing>"} is not the explicitly allowlisted ALLOWED_DEV_REF ${allowedDevRef}.`);
  }
}