"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else window.location.href = safeNext;
    setBusy(false);
  }

  return (
    <main id="main-content" className="auth" tabIndex={-1}>
      <div className="authcard">
        <a href="/" className="back">← Back</a>
        <div className="mark big">SFI</div>
        <h1>Welcome back</h1>
        <p>Sign in to connect your academic profile, requests, resources and notifications.</p>
        <form onSubmit={submit}>
          <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@cusat.ac.in" /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" /></label>
          {error && <div className="notice"><div className="icon" style={{ margin: 0 }}>!</div><div><strong>Sign-in failed</strong><p>{error}</p></div></div>}
          <button className="btn primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="fine">New here? <a href="/register" style={{ color: "var(--red)", fontWeight: 700 }}>Create an account</a></p>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Suspense fallback={<main id="main-content" className="auth" tabIndex={-1}><div className="authcard">Loading sign in…</div></main>}>
        <SignInForm />
      </Suspense>
    </>
  );
}
