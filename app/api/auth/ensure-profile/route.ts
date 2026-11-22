import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";

export async function POST() {
  const authClient = await createClient();
  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    await ensureProfileForUser(createServiceClient(), data.user);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to initialize your student profile." }, { status: 500 });
  }
}
