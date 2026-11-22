import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Samskara Events");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
