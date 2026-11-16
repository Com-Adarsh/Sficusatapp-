import type { AuthConfig } from "convex/server";

const issuer = process.env.SUPABASE_AUTH_ISSUER ?? "https://example.supabase.co/auth/v1";

export default {
  providers: [{ domain: issuer, applicationID: "authenticated" }],
} satisfies AuthConfig;
