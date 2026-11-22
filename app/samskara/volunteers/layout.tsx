import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Volunteer with Samskara", "Join Samskara volunteer teams and discover cultural event roles, skills and availability for campus activities and programmes.", "/samskara/volunteers");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
