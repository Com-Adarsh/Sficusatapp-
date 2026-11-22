import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cancelGrievanceByToken } from "../../lib/grievances/token";

const token = "test-tracking-token";
const expectedHash = createHash("sha256").update(token, "utf8").digest("hex");
const calls: unknown[] = [];

const fakeService = {
  from(table: string) {
    calls.push(["from", table]);
    return {
      update(values: Record<string, unknown>) {
        calls.push(["update", values]);
        return {
          eq(column: string, value: unknown) {
            calls.push(["eq", column, value]);
            return {
              in(column2: string, values: unknown[]) {
                calls.push(["in", column2, values]);
                return {
                  select(columns: string) {
                    calls.push(["select", columns]);
                    return {
                      async maybeSingle() {
                        calls.push(["maybeSingle"]);
                        return {
                          data: { id: "g1", status: "cancelled", updated_at: "2026-11-22T00:00:00Z" },
                          error: null,
                        };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    };
  },
};

const result = await cancelGrievanceByToken(fakeService, token);
assert.equal(result.data?.status, "cancelled");
assert.deepEqual(calls[2], ["eq", "tracking_token_hash", expectedHash]);
assert.deepEqual(calls[3], ["in", "status", ["open", "in_progress"]]);
console.log("PASS grievance cancellation is token-based and status-limited");
