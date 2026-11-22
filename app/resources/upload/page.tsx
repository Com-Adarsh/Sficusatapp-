import { requireRole } from "@/lib/auth/guards";
import type { Metadata } from "next";
import UploadClient from "./UploadClient";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ProtectedPage() { await requireRole("moderator", "app/resources/upload"); return <UploadClient />; }
