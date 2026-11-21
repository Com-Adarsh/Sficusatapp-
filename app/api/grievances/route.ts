import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const schema = z.object({
  category: z.enum(["general", "academic", "hostel", "fees", "accessibility", "ragging_harassment", "wellbeing", "other"]),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5000),
  anonymous: z.boolean().default(false),
});

function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid grievance details." }, { status: 400 });

  const authClient = await createClient();
  const { data: claimsData } = await authClient.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const service = createServiceClient();
  const { data, error } = await service.from("grievances").insert({
    owner_id: userId,
    tracking_token_hash: tokenHash,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    anonymous: parsed.data.anonymous,
  }).select("id,created_at").single();

  if (error || !data) return NextResponse.json({ error: "Unable to submit grievance." }, { status: 500 });

  return NextResponse.json({ trackingToken: token, createdAt: data.created_at });
}
