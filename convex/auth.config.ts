import type { AuthConfig } from "convex/server";

const SUPABASE_AUTH_ISSUER = process.env.SUPABASE_AUTH_ISSUER;

if (!SUPABASE_AUTH_ISSUER) {
  throw new Error(
    "SUPABASE_AUTH_ISSUER must be configured on the Convex deployment."
  );
}

export default {
  providers: [{ domain: SUPABASE_AUTH_ISSUER, applicationID: "authenticated" }],
} satisfies AuthConfig;
