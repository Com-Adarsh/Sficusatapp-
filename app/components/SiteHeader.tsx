"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, CircleUserRound, Home, LifeBuoy, Menu, Search, Sparkles, X } from "lucide-react";

const primary = [["home","Home","/"],["learn","Learn","/resources"],["ai","Study AI","/ai"],["support","Support","/support"],["scholarx","SCHOLARX","/opportunities"],["profile","Profile","/profile"]];
const moreLinks = [["support","Support","/support"],["aashraya","Aashraya","/aashraya"],["sahayi","Sahayi","/sahayi"],["samskara","Samskara","/samskara"],["profile","Profile","/profile"]];
const icons: Record<string, React.ReactNode> = {
  home:<Home size={16} aria-hidden="true" />, learn:<BookOpen size={16} aria-hidden="true" />,
  ai:<Sparkles size={16} aria-hidden="true" />, support:<LifeBuoy size={16} aria-hidden="true" />,
  scholarx:<Sparkles size={16} aria-hidden="true" />, profile:<CircleUserRound size={16} aria-hidden="true" />
};

export default function SiteHeader() {
  const [open,setOpen]=useState(false);
  const pathname=usePathname();
  const moreButtonRef=useRef<HTMLButtonElement>(null);
  const drawerRef=useRef<HTMLDivElement>(null);
  const isActive=(href:string)=>href==="/" ? pathname==="/" : pathname.startsWith(href);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return <header className="reference-header">
    <nav className="nav">
      <div className="shell navin">
        <a className="brand" href="/" aria-label="SFI CUSAT Digital Student Platform home">
          <img src="/logos/sfi-cusat.png" alt="SFI CUSAT logo" style={{width:38,height:38,objectFit:"contain",borderRadius:10,flexShrink:0}} />
          <span>SFI CUSAT<small>Digital Student Platform</small></span>
        </a>
        <div className="links reference-links desktop-links" aria-label="Main navigation">
          {primary.map(([key,label,href])=><a key={key} href={href} aria-current={isActive(href)?"page":undefined}><span className="nav-icon" aria-hidden="true">{icons[key]}</span>{label}</a>)}
        </div>
        <div className="nav-actions">
          <a className="icon-btn reference-icon" href="/search" aria-label="Search the platform"><Search size={17} aria-hidden="true" /></a>
          <a className="btn primary desktop-sign reference-sign" href="/sign-in">Sign in</a>
          <button className="menu-btn" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-more-drawer" aria-label={open?"Close menu":"Open menu"}>{open?<X size={20} aria-hidden="true" />:<Menu size={20} aria-hidden="true" />}</button>
        </div>
      </div>
      {open&&<div id="mobile-more-drawer" ref={drawerRef} className="mobile-menu reference-mobile-menu"><div className="shell">
        {moreLinks.map(([key,label,href])=><a key={key} href={href} aria-current={isActive(href)?"page":undefined} onClick={()=>setOpen(false)}><span><span aria-hidden="true">{icons[key]}</span>{label}</span><span aria-hidden="true">→</span></a>)}
        <a href="/sign-in" onClick={()=>setOpen(false)}>Sign in <span aria-hidden="true">→</span></a>
      </div></div>}
    </nav>
    <nav className="mobilebar reference-mobilebar" aria-label="Mobile navigation">
      {[primary[0],primary[1],primary[4],primary[2]].map(([key,label,href])=><a key={key} href={href} aria-current={isActive(href)?"page":undefined}><b aria-hidden="true">{icons[key]}</b>{label==="Study AI"?"AI":label}</a>)}
      <button ref={moreButtonRef} type="button" className="reference-mobile-more" aria-expanded={open} aria-controls="mobile-more-drawer" onClick={()=>setOpen(!open)}><b aria-hidden="true"><Menu size={16} /></b>More</button>
    </nav>
  </header>;
}
