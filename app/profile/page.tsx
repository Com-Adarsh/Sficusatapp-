import { requireUser } from "@/lib/auth/guards";
import ProfileClient from "./ProfileClient";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function ProfilePage() { await requireUser("/profile"); return <ProfileClient />; }
