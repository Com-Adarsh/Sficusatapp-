import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Study AI for CUSAT Students", "Use the student-run Study AI assistant for step-by-step academic explanations with programme and semester context.", "/ai");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
