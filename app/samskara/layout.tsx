import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Samskara Culture & Creativity at CUSAT", "Explore Samskara cultural events, competitions, publications, galleries and volunteer opportunities for the CUSAT student community.", "/samskara");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
