import type { AuthConfig } from "convex/server";

// Replace this issuer with the project's Supabase Auth issuer before production deployment.
// Expected format: https://<project-ref>.supabase.co/auth/v1
const SUPABASE_AUTH_ISSUER = "https://example.supabase.co/auth/v1";

export default {
  providers: [{ domain: SUPABASE_AUTH_ISSUER, applicationID: "authenticated" }],
} satisfies AuthConfig;
