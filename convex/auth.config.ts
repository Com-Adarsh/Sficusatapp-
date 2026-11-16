import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.SUPABASE_AUTH_ISSUER!,
      applicationID: "authenticated",
    },
  ],
} satisfies AuthConfig;
