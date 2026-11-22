import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Register as an Aashraya Blood Donor", "Register your availability with Aashraya as a blood donor while keeping personal contact details private from public pages.", "/aashraya/donor");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
