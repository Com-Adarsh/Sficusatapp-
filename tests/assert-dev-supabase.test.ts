import assert from "node:assert/strict";
import { assertDevSupabaseTarget } from "../scripts/assert-dev-supabase";

const protectedRefs = ["jwhyesglviptvklrclll", "uzfgyojiiqasohlozsyx"];

for (const ref of protectedRefs) {
  assert.throws(
    () => assertDevSupabaseTarget(ref, ref),
    /explicitly blocked/,
    `protected ref ${ref} must always be refused`,
  );
}

assert.throws(
  () => assertDevSupabaseTarget(undefined, undefined),
  /ALLOWED_DEV_REF is unset/,
);

console.log("PASS: protected Supabase refs are always refused.");
