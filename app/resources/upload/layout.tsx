import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Upload Resource");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
