import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Sahayi Scribe & Accessibility Support", "Access Sahayi scribe and accessibility support for exam assistance, volunteer registration and coordinated student support.", "/sahayi");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
