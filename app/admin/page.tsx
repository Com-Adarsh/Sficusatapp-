import { requireRole } from "@/lib/auth/guards";
import type { Metadata } from "next";
import AdminClient from "./AdminClient";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ProtectedPage() { await requireRole("admin", "app/admin"); return <AdminClient />; }
