import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CbtCoordinatorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["moderator", "admin"], "/support/helpdesk/academic/cbt/coordinator");
  return children;
}
