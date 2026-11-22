import { createHash } from "node:crypto";

type CancelResult = {
  data: { id: string; status: string; updated_at: string } | null;
  error: { message: string } | null;
};

type CancelClient = {
  from(table: string): {
    update(values: Record<string, unknown>): {
      eq(column: string, value: unknown): {
        in(column: string, values: unknown[]): {
          select(columns: string): {
            maybeSingle(): Promise<CancelResult>;
          };
        };
      };
    };
  };
};

export async function cancelGrievanceByToken(service: CancelClient, token: string) {
  const hash = createHash("sha256").update(token, "utf8").digest("hex");
  return service
    .from("grievances")
    .update({ status: "cancelled" })
    .eq("tracking_token_hash", hash)
    .in("status", ["open", "in_progress"])
    .select("id,status,updated_at")
    .maybeSingle();
}
