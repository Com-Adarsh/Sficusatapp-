import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    SUPABASE_AUTH_ISSUER: v.string(),
    PLATFORM_BOOTSTRAP_SECRET: v.optional(v.string()),
  },
});

export default app;
