import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Aashraya");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
