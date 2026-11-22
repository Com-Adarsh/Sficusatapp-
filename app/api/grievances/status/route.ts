import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { cancelGrievanceByToken } from "@/lib/grievances/token";

const schema = z.object({
  token: z.string().trim().min(20).max(200),
  action: z.enum(["status", "cancel"]).default("status"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid tracking token." }, { status: 400 });
  const hash = createHash("sha256").update(parsed.data.token, "utf8").digest("hex");
  const service = createServiceClient();
  if (parsed.data.action === "cancel") {
    const { data, error } = await cancelGrievanceByToken(service, parsed.data.token);

    if (error || !data) return NextResponse.json({ error: "No cancellable grievance was found for that tracking token." }, { status: 404 });
    return NextResponse.json({ grievance: data });
  }

  const { data, error } = await service
    .from("grievances")
    .select("id,title,description,category,status,anonymous,created_at,updated_at,grievance_updates(status,note,created_at)")
    .eq("tracking_token_hash", hash)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "No grievance was found for that tracking token." }, { status: 404 });
  return NextResponse.json({ grievance: data });
}
