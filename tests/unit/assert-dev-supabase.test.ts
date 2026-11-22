import assert from "node:assert/strict";
import { assertDevSupabaseTarget } from "../../scripts/assert-dev-supabase";

for (const ref of ["jwhyesglviptvklrclll", "uzfgyojiiqasohlozsyx"]) {
  assert.throws(() => assertDevSupabaseTarget(ref, ref), /explicitly blocked/);
}
assert.throws(() => assertDevSupabaseTarget("some-dev-ref", undefined), /ALLOWED_DEV_REF is unset/);
assert.doesNotThrow(() => assertDevSupabaseTarget("some-dev-ref", "some-dev-ref"));
console.log("PASS protected Supabase refs are denied");
