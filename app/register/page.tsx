"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
      window.location.href = "/profile";
      return;
    } else {
      setMessage("Account created. Check your email to verify your account, then sign in.");
    }
    setBusy(false);
  }

  return (
    <main className="auth">
      <div className="authcard">
        <a href="/" className="back">← Back</a>
        <div className="mark big">SFI</div>
        <h1>Create your account</h1>
        <p>Create a real student account and then complete your academic profile.</p>
        <form onSubmit={submit}>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name" /></label>
          <label>CUSAT email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@cusat.ac.in" /></label>
          <label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required /></label>
          <label>Confirm password<input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" minLength={8} required /></label>
          {error && <div className="notice"><div className="icon" style={{ margin: 0 }}>!</div><div><strong>Registration failed</strong><p>{error}</p></div></div>}
          {message && <div className="notice"><div className="icon" style={{ margin: 0 }}>✓</div><div><strong>Check your email</strong><p>{message}</p></div></div>}
          <button className="btn primary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="fine">Already registered? <a href="/sign-in" style={{ color: "var(--red)", fontWeight: 700 }}>Sign in</a></p>
      </div>
    </main>
  );
}
