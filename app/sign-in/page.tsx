"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
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
    else window.location.href = "/dashboard";
    setBusy(false);
  }

  return (
    <main className="auth">
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
