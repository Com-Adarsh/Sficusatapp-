import type { MetadataRoute } from "next";

const SITE_URL = "https://sficusatapp.vercel.app";

const publicRoutes = [
  "/",
  "/resources",
  "/resources/browse",
  "/opportunities",
  "/opportunities/browse",
  "/scholarships",
  "/support",
  "/aashraya",
  "/aashraya/camps",
  "/sahayi",
  "/samskara",
  "/samskara/events",
  "/samskara/competitions",
  "/samskara/gallery",
  "/samskara/magazine",
  "/samskara/volunteers",
  "/updates",
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
