"use client";

import { useState } from "react";
import { BookOpen, CircleUserRound, Home, LifeBuoy, Menu, Search, Sparkles, X } from "lucide-react";

const primary = [
  ["home", "Home", "/"],
  ["learn", "Learn", "/resources"],
  ["support", "Support", "/support"],
  ["scholarx", "SCHOLARX", "/opportunities"],
  ["samskara", "Samskara", "/samskara"],
  ["profile", "Profile", "/profile"],
];

const icons: Record<string, React.ReactNode> = {
  home: <Home size={17} aria-hidden="true" />,
  learn: <BookOpen size={17} aria-hidden="true" />,
  support: <LifeBuoy size={17} aria-hidden="true" />,
  scholarx: <Sparkles size={17} aria-hidden="true" />,
  samskara: <Sparkles size={17} aria-hidden="true" />,
  profile: <CircleUserRound size={17} aria-hidden="true" />,
};

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="reference-header">
      <nav className="nav">
        <div className="shell navin">
          <a className="brand" href="/" aria-label="SFI CUSAT Digital Student Platform home">
            <img src="/logos/sfi-cusat.png" alt="SFI CUSAT logo" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 10, flexShrink: 0 }} />
            <span>SFI CUSAT<small>Digital Student Platform</small></span>
          </a>
          <div className="links reference-links desktop-links" aria-label="Main navigation">
            {primary.map(([key, label, href]) => (
              <a key={key} href={href}><span className="nav-icon">{icons[key]}</span>{label}</a>
            ))}
          </div>
          <div className="nav-actions">
            <a className="icon-btn reference-icon" href="/search" aria-label="Search"><Search size={18} aria-hidden="true" /></a>
            <a className="btn primary desktop-sign reference-sign" href="/sign-in">Sign in</a>
            <button className="menu-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="mobile-menu reference-mobile-menu">
            <div className="shell">
              {primary.map(([key, label, href]) => (
                <a key={key} href={href} onClick={() => setOpen(false)}><span>{icons[key]}{label}</span><span>→</span></a>
              ))}
              <a href="/sign-in" onClick={() => setOpen(false)}>Sign in <span>→</span></a>
            </div>
          </div>
        )}
      </nav>
      <nav className="mobilebar reference-mobilebar" aria-label="Mobile navigation">
        {primary.slice(0, 5).map(([key, label, href]) => (
          <a key={key} href={href}><b>{icons[key]}</b>{label}</a>
        ))}
      </nav>
    </header>
  );
}
