import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({ token: z.string().trim().min(20).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid tracking token." }, { status: 400 });
  const hash = createHash("sha256").update(parsed.data.token, "utf8").digest("hex");
  const service = createServiceClient();
  const { data, error } = await service.from("grievances").select("id,title,description,category,status,anonymous,created_at,updated_at,grievance_updates(status,note,created_at)").eq("tracking_token_hash", hash).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "No grievance was found for that tracking token." }, { status: 404 });
  return NextResponse.json({ grievance: data });
}
