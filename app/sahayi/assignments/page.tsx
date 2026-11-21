import { requireRole } from "@/lib/auth/guards";
import type { Metadata } from "next";
import AssignmentsClient from "./AssignmentsClient";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ProtectedPage() { await requireRole("sahayi_coordinator", "app/sahayi/assignments"); return <AssignmentsClient />; }
