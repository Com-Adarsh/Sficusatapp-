"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignIn(){
  const [message,setMessage]=useState('')
  const [loading,setLoading]=useState(false)

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setLoading(true);setMessage('')
    const form=new FormData(e.currentTarget)
    const email=String(form.get('email')||'').trim()
    const password=String(form.get('password')||'')
    const supabase=createClient()
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error){setMessage(error.message);setLoading(false);return}
    window.location.href='/profile'
  }

  return <main className="auth"><div className="authcard"><a href="/" className="back">← Back</a><div className="mark big">SFI</div><h1>Welcome back</h1><p>Sign in to access your student profile and services.</p><form onSubmit={submit}><label>Email<input name="email" type="email" required placeholder="you@cusat.ac.in" /></label><label>Password<input name="password" type="password" required placeholder="••••••••" /></label><button className="btn primary" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form>{message&&<p className="fine" role="alert">{message}</p>}<p className="fine">New here? <a href="/register" style={{color:'var(--red)',fontWeight:700}}>Create an account</a></p></div></main>
}