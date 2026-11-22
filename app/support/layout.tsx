import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Student Support & Helpdesk at CUSAT", "Find structured student support for grievances, helpdesk requests, student issues and interventions, with privacy-aware guidance for CUSAT students.", "/support");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
