import { requireUser } from "@/lib/auth/guards";
import DashboardClient from "./DashboardClient";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function DashboardPage() { await requireUser("/dashboard"); return <DashboardClient />; }
