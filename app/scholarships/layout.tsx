import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Scholarships for CUSAT Students", "Explore scholarship opportunities and financial-support information for CUSAT students, with listings organised for easier discovery.", "/scholarships");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
