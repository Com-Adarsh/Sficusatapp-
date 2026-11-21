import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/profile");
  return children;
}
