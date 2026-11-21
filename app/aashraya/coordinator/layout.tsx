import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AashrayaCoordinatorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["aashraya_coordinator", "admin"], "/aashraya/coordinator");
  return children;
}
