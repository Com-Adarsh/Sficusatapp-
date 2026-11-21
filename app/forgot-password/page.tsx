"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email,setEmail]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");
    const {error}=await createClient().auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});
    if(error)setError(error.message);else setMessage("If an account exists for that email, a password reset link has been sent.");setBusy(false);
  }
  return <main className="auth"><div className="authcard"><a href="/sign-in" className="back">← Back to sign in</a><div className="mark big">SFI</div><h1>Reset your password</h1><p>Enter your email. We won't reveal whether an account exists.</p>
    <form onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required /></label>
      {error&&<div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Could not send reset link</strong><p>{error}</p></div></div>}
      {message&&<div className="notice"><div className="icon" style={{margin:0}}>✓</div><div><strong>Check your email</strong><p>{message}</p></div></div>}
      <button className="btn primary" disabled={busy}>{busy?"Sending…":"Send reset link"}</button>
    </form></div></main>;
}
