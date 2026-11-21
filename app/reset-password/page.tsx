"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(e:React.FormEvent){e.preventDefault();setError("");setMessage("");if(password!==confirm){setError("Passwords do not match.");return;}setBusy(true);
    const {error}=await createClient().auth.updateUser({password});if(error)setError(error.message);else setMessage("Password updated. You can now sign in with your new password.");setBusy(false);
  }
  return <main className="auth"><div className="authcard"><div className="mark big">SFI</div><h1>Choose a new password</h1><p>Use at least 8 characters.</p>
    <form onSubmit={submit}><label>New password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={8} autoComplete="new-password" required /></label>
    <label>Confirm password<input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" minLength={8} autoComplete="new-password" required /></label>
    {error&&<div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Password update failed</strong><p>{error}</p></div></div>}
    {message&&<div className="notice"><div className="icon" style={{margin:0}}>✓</div><div><strong>Password updated</strong><p>{message}</p><a href="/sign-in">Continue to sign in</a></div></div>}
    <button className="btn primary" disabled={busy||Boolean(message)}>{busy?"Updating…":"Update password"}</button></form></div></main>;
}
