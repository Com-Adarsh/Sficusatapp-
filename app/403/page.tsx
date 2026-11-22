import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function ForbiddenPage() {
  return <main className="auth"><div className="authcard"><div className="mark big">SFI</div><div className="eyebrow">403 · Access denied</div><h1>This area is restricted.</h1><p>Your account is signed in, but it does not have the role required for this workspace.</p><div className="actions"><Link className="btn primary" href="/dashboard">Back to dashboard</Link><Link className="btn" href="/">Home</Link></div></div></main>;
}
