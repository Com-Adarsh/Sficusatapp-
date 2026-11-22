import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Reset Password");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
