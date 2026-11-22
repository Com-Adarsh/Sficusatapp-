import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Samskara Cultural Events at CUSAT", "Discover Samskara cultural events and campus programmes, with details for students interested in participating and attending.", "/samskara/events");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
