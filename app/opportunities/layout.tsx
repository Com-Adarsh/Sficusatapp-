import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Scholarships, Internships & Jobs for CUSAT", "Discover scholarships, internships, jobs and fellowships curated for CUSAT students through the SCHOLARX opportunities hub.", "/opportunities");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
