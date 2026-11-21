import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SahayiCoordinatorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["sahayi_coordinator", "admin"], "/sahayi/coordinator");
  return children;
}
