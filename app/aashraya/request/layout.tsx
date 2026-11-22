import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Request Blood Support from Aashraya", "Submit a blood support request to Aashraya with the details coordinators need to review and coordinate donor assistance.", "/aashraya/request");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
