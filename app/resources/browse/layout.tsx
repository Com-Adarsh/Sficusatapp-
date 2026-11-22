import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Browse CUSAT Notes & Question Papers", "Browse academic notes, question papers, syllabi and updates by programme, semester, department and course for CUSAT students.", "/resources/browse");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
