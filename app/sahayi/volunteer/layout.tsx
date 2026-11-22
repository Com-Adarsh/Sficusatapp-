import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Volunteer as a Scribe with Sahayi", "Learn how to volunteer as a scribe with Sahayi, including subjects, languages and availability for coordinator review and matching.", "/sahayi/volunteer");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
