import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Scholarship Guidance Chat", "Get general scholarship guidance through the SFI CUSAT student platform and explore relevant scholarship information and resources.", "/scholarships/chat");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
