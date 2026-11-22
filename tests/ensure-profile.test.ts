import assert from "node:assert/strict";
import { ensureProfileForUser } from "../lib/auth/ensure-profile";

const profiles = new Map<string, string>();
const roles = new Set<string>();

const service = {
  from(table: string) {
    return {
      async upsert(values: Record<string, unknown>) {
        if (table === "profiles") profiles.set(String(values.id), String(values.full_name));
        if (table === "user_roles") roles.add(String(values.user_id) + ":" + String(values.role));
        return { error: null };
      },
    };
  },
};

const user = {
  id: "10000000-0000-0000-0000-000000000099",
  email: "student@example.invalid",
  user_metadata: { full_name: "CI Student" },
};

await ensureProfileForUser(service, user);
await ensureProfileForUser(service, user);

assert.equal(profiles.get(user.id), "CI Student");
assert.equal(roles.size, 1);
assert.equal(roles.has(user.id + ":student"), true);

console.log("ensure-profile idempotency test passed");
