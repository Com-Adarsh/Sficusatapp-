import { assertDevSupabaseTarget } from "./assert-dev-supabase";

const protectedRefs = ["jwhyesglviptvklrclll","uzfgyojiiqasohlozsyx"];
for (const ref of protectedRefs) {
  let refused = false;
  try { assertDevSupabaseTarget(ref, ref); } catch { refused = true; }
  if (!refused) throw new Error("Expected protected ref " + ref + " to be refused.");
}
const allowed = "dev-example-ref";
assertDevSupabaseTarget(allowed, allowed);
let unsetRefused = false;
try { assertDevSupabaseTarget(allowed, undefined); } catch { unsetRefused = true; }
if (!unsetRefused) throw new Error("Expected unset ALLOWED_DEV_REF to be refused.");
console.log("assert-dev-supabase guard tests passed");
