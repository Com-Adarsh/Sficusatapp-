import type { AuthConfig } from "convex/server";

const SUPABASE_AUTH_ISSUER = "https://jwhyesglviptvklrclll.supabase.co/auth/v1";

export default {
  providers: [{ domain: SUPABASE_AUTH_ISSUER, applicationID: "authenticated" }],
} satisfies AuthConfig;
