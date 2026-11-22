import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Aashraya Blood Donation Camps", "Discover Aashraya blood donation camps, campus drives and registration information for students and community participants.", "/aashraya/camps");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
