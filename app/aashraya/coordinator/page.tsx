import { requireRole } from "@/lib/auth/guards";
import type { Metadata } from "next";
import CoordinatorClient from "./CoordinatorClient";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ProtectedPage() { await requireRole("aashraya_coordinator", "app/aashraya/coordinator"); return <CoordinatorClient />; }
