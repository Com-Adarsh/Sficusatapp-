import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Samskara Student Magazine", "Read Samskara student magazine content and learn how students can contribute creative work to future issues and editions.", "/samskara/magazine");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
