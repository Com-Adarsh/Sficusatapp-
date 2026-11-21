const DEV_REF = "jwhyesglviptvklrclll";
const PRODUCTION_REF = "bdeuecrwqrnlwhxwbpmi";

export function assertDevSupabaseTarget(projectRef = process.env.SUPABASE_PROJECT_REF) {
  if (projectRef === PRODUCTION_REF) throw new Error(`REFUSED: Supabase production project ${PRODUCTION_REF} is never a migration target.`);
  if (projectRef !== DEV_REF) throw new Error(`REFUSED: expected dev Supabase ref ${DEV_REF}, got ${projectRef ?? "<missing>"}.`);
}
