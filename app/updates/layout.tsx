import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("SFI CUSAT Student Platform Updates", "Read SFI CUSAT platform updates, academic notices, opportunities and initiative announcements in one organised student feed.", "/updates");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
