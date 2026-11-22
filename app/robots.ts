import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profile",
        "/admin",
        "/coordinator",
        "/aashraya/coordinator",
        "/sahayi/coordinator",
        "/sahayi/assignments",
        "/sign-in",
        "/forgot-password",
        "/reset-password",
        "/auth/callback",
        "/support/grievance/",
        "/aashraya/request/status",
        "/resources/upload",
        "/403",
      ],
    },
    sitemap: "https://sficusatapp.vercel.app/sitemap.xml",
  };
}
