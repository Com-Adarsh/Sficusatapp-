"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Register() {
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)

  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage('')
    const form=new FormData(e.currentTarget)
    const email=String(form.get('email')||'').trim()
    const password=String(form.get('password')||'')
    const confirm=String(form.get('confirm')||'')
    const fullName=String(form.get('fullName')||'').trim()
    if(password!==confirm){setMessage('Passwords do not match.');setLoading(false);return}
    if(password.length<8){setMessage('Use a password with at least 8 characters.');setLoading(false);return}
    const supabase=createClient()
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}})
    if(error){setMessage(error.message);setLoading(false);return}
    setMessage(data.session ? 'Account created. You can continue to your profile.' : 'Account created. Check your email to confirm your address.')
    setLoading(false)
  }

  return <main className="auth"><div className="authcard"><a href="/" className="back">← Back</a><div className="mark big">SFI</div><h1>Create your account</h1><p>One account for student resources and support services.</p><form onSubmit={submit}><label>Full name<input name="fullName" required placeholder="Your full name" /></label><label>CUSAT email<input name="email" type="email" required placeholder="you@cusat.ac.in" /></label><label>Password<input name="password" type="password" required placeholder="At least 8 characters" /></label><label>Confirm password<input name="confirm" type="password" required placeholder="Repeat password" /></label><button className="btn primary" disabled={loading}>{loading?'Creating…':'Create account'}</button></form>{message&&<p className="fine" role="status">{message}</p>}<p className="fine">Student verification can be added after the basic account flow is connected.</p></div></main>
}