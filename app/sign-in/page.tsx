"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("\n") || value.includes("\r")) return "/dashboard";
  return value;
}

function SignInForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setBusy(false); return; }
    window.location.assign(next);
  }

  async function google() {
    setGoogleBusy(true); setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    if (error) { setError(error.message); setGoogleBusy(false); }
  }

  return <main className="auth"><div className="authcard">
    <a href="/" className="back">← Back</a><div className="mark big">SFI</div>
    <h1>Welcome back</h1><p>Sign in to your student account.</p>
    <button className="btn" type="button" onClick={google} disabled={busy || googleBusy}>{googleBusy ? "Connecting to Google…" : "Continue with Google"}</button>
    <p className="fine" style={{textAlign:"center"}}>or use email and password</p>
    <form onSubmit={submit}>
      <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
      <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" required /></label>
      {error && <div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Sign-in failed</strong><p>{error}</p></div></div>}
      <button className="btn primary" disabled={busy || googleBusy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="fine"><a href="/forgot-password" style={{color:"var(--red)",fontWeight:700}}>Forgot password?</a></p>
    <p className="fine">New here? <a href="/register" style={{color:"var(--red)",fontWeight:700}}>Create an account</a></p>
  </div></main>;
}

export default function SignIn() {
  return <Suspense fallback={<main className="auth"><div className="authcard">Loading sign in…</div></main>}><SignInForm /></Suspense>;
}
