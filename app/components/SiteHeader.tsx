"use client";
import {useState} from "react";
const primary=[["Study Resources · Abhimanyu","/resources"],["SCHOLARX","/opportunities"],["Blood Support · Aashraya","/aashraya"],["Scribe Support · Sahayi","/sahayi"],["Campus Culture · Samskara","/samskara"],["Student Support","/support"],["Updates","/updates"]];
export default function SiteHeader(){
 const[open,setOpen]=useState(false);
 return <header className="site-header">
  <div className="top"><div className="shell topin"><span>SFI CUSAT · Student services ecosystem</span><span>English · മലയാളം</span></div></div>
  <nav className="nav"><div className="shell navin">
   <a className="brand" href="/" aria-label="SFI CUSAT Digital Student Platform home">
    <img src="/logos/sfi-cusat.png" alt="SFI CUSAT logo" style={{width:42,height:42,objectFit:"contain",borderRadius:10,flexShrink:0}} />
    <span>SFI CUSAT<small>Digital Student Platform</small></span>
   </a>
   <div className="links desktop-links">{primary.map(([t,h])=><a key={h} href={h}>{t}</a>)}</div>
   <div className="nav-actions"><a className="icon-btn" href="/search" aria-label="Search">Search</a><a className="icon-btn" href="/dashboard" aria-label="My dashboard">Dashboard</a><a className="btn primary desktop-sign" href="/sign-in">Sign in</a><button className="menu-btn" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Menu">☰</button></div>
  </div>
  {open&&<div className="mobile-menu"><div className="shell">{primary.map(([t,h])=><a key={h} href={h} onClick={()=>setOpen(false)}>{t}<span>→</span></a>)}<a href="/dashboard">Dashboard <span>→</span></a><a href="/profile">Profile <span>→</span></a><a href="/sign-in">Sign in <span>→</span></a></div></div>}
  </nav>
 </header>
}