import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Samskara Cultural Competitions", "Explore Samskara cultural competitions, registration information, rounds and results for participating CUSAT students and creators.", "/samskara/competitions");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
