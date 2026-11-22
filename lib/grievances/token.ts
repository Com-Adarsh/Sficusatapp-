import { createHash } from "node:crypto";

type ServiceClientLike = {
  from(table: string): {
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): {
        in(column: string, values: string[]): {
          select(columns: string): {
            maybeSingle(): Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
    };
  };
};

export async function cancelGrievanceByToken(service: ServiceClientLike, token: string) {
  const hash = createHash("sha256").update(token, "utf8").digest("hex");
  return service
    .from("grievances")
    .update({ status: "cancelled" })
    .eq("tracking_token_hash", hash)
    .in("status", ["open", "in_progress"])
    .select("id,status,updated_at")
    .maybeSingle();
}
