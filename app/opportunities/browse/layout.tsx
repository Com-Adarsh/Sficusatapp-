import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Browse Scholarships, Internships & Jobs", "Search and filter scholarships, internships, jobs and fellowships available to CUSAT students through the SCHOLARX hub.", "/opportunities/browse");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
