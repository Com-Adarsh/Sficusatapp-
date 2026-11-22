import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Request a Scribe Through Sahayi", "Request exam scribe support through Sahayi and share only the accessibility information needed for coordinator assistance.", "/sahayi/request");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
