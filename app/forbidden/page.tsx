import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access denied | SFI CUSAT",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return <main className="auth"><div className="authcard">
    <div className="mark big">SFI</div>
    <h1>Access denied</h1>
    <p>Your account does not have the role required to access this area.</p>
    <a className="btn primary" href="/dashboard">Return to dashboard</a>
  </div></main>;
}
