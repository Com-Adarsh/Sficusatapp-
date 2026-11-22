import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Samskara Student Gallery", "Browse moderated Samskara event galleries and student creative media shared through the SFI CUSAT cultural wing for students and visitors.", "/samskara/gallery");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
