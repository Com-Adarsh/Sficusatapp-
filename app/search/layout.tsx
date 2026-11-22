import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Search SFI CUSAT Student Resources", "Search the SFI CUSAT platform for academic resources, support services, opportunities and student initiatives in one place.", "/search");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
