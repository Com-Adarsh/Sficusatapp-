import assert from "node:assert/strict";
import { cancelGrievanceByToken } from "../lib/grievances/token";

let receivedHash = "";
const service = {
  from() {
    return {
      update() {
        return {
          eq(_column: string, value: string) {
            receivedHash = value;
            return {
              in() {
                return {
                  select() {
                    return {
                      maybeSingle: async () => ({
                        data: { id: "g1", status: "cancelled" },
                        error: null,
                      }),
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

const result = await cancelGrievanceByToken(service, "throwaway-tracking-token");
assert.equal((result.data as any).status, "cancelled");
assert.equal(receivedHash.length, 64);
assert.notEqual(receivedHash, "throwaway-tracking-token");
console.log("PASS: grievance cancellation uses a hashed tracking token.");
