import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Aashraya Blood Donation Support", "Access Aashraya blood donation support for blood requests, donor registration and campus donation camps through SFI CUSAT.", "/aashraya");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
