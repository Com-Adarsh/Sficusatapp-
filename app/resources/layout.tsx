import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Academic Resources for CUSAT Students", "Find academic notes, question papers, syllabi and verified study resources for CUSAT students across programmes and semesters.", "/resources");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
