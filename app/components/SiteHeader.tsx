"use client";
import { useState } from "react";
const links=[["Abhimanyu","/resources"],["Opportunities","/opportunities"],["Aashraya","/aashraya"],["Sahayi","/sahayi"],["Samskara","/samskara"],["Support","/support"],["Updates","/updates"]];
export default function SiteHeader(){
  const [open,setOpen]=useState(false);
  return <header className="site-header">
    <div className="top"><div className="shell topin"><span>Student services for CUSAT students</span><span>English · മലയാളം</span></div></div>
    <nav className="nav"><div className="shell navin">
      <a className="brand" href="/"><span className="mark">SFI</span><span>SFI CUSAT<small>Digital Student Platform</small></span></a>
      <div className="links desktop-links">{links.map(([t,h])=><a key={h} href={h}>{t}</a>)}</div>
      <div className="nav-actions"><a className="icon-btn" href="/search" aria-label="Search">⌕</a><a className="icon-btn" href="/profile" aria-label="Profile">○</a><a className="btn primary desktop-sign" href="/sign-in">Sign in</a><button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Menu">☰</button></div>
    </div>
    {open&&<div className="mobile-menu"><div className="shell">{links.map(([t,h])=><a key={h} href={h} onClick={()=>setOpen(false)}>{t}<span>→</span></a>)}<a href="/dashboard">Dashboard <span>→</span></a><a href="/sign-in">Sign in <span>→</span></a></div></div>}
    </nav>
  </header>
}