import assert from "node:assert/strict";
import { ensureProfileForUser } from "../../lib/auth/ensure-profile";

const calls: Array<{ table: string; values: unknown; options: unknown }> = [];
const fakeClient = {
  from(table: string) {
    return {
      async upsert(values: unknown, options?: unknown) {
        calls.push({ table, values, options });
        return { error: null };
      },
    };
  },
};

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "student@example.com",
  user_metadata: {},
};

await ensureProfileForUser(fakeClient, user);
await ensureProfileForUser(fakeClient, user);

assert.equal(calls.length, 4);
assert.deepEqual(calls[0].values, { id: user.id, full_name: "student" });
assert.deepEqual(calls[1].values, { user_id: user.id, role: "student" });
assert.deepEqual(calls[0].options, { onConflict: "id" });
assert.deepEqual(calls[1].options, { onConflict: "user_id,role" });
console.log("PASS ensure_profile is idempotent and repairs profile + student role");
