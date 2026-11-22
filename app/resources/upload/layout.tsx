import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ResourceUploadLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["moderator", "admin"], "/resources/upload");
  return children;
}
