import type { MetadataRoute } from "next";

const SITE_URL = "https://sficusatapp.vercel.app";

const publicRoutes = [
  // Demo-backed modules are intentionally excluded until live data is connected.

  "/",
  "/support",
  "/sahayi",
  "/samskara",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = publicRoutes.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
  }));

  // Add generated public URLs here later, for example verified certificates
  // or other published content with stable canonical URLs.
  const dynamicUrls: MetadataRoute.Sitemap = [];

  return [...staticUrls, ...dynamicUrls];
}
