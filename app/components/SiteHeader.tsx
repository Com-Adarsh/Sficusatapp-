"use client";

import { useState } from "react";
import { BookOpen, CircleUserRound, Home, LifeBuoy, Menu, Search, Sparkles, X, BriefcaseBusiness } from "lucide-react";

const primary = [
  ["home", "Home", "/"],
  ["learn", "Learn", "/resources"],
  ["ai", "Study AI", "/ai"],
  ["support", "Support", "/support"],
  ["scholarx", "Opportunities", "/opportunities"],
  ["profile", "Profile", "/profile"],
];

const icons: Record<string, React.ReactNode> = {
  home: <Home size={18} aria-hidden="true" />,
  learn: <BookOpen size={18} aria-hidden="true" />,
  ai: <Sparkles size={18} aria-hidden="true" />,
  support: <LifeBuoy size={18} aria-hidden="true" />,
  scholarx: <BriefcaseBusiness size={18} aria-hidden="true" />,
  profile: <CircleUserRound size={18} aria-hidden="true" />,
};

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pro-header">
      <nav className="pro-nav">
        <div className="pro-nav-inner shell">
          <a className="pro-brand" href="/" aria-label="SFI CUSAT Digital Student Platform home">
            <span className="pro-brand-mark">
              <img src="/logos/sfi-cusat.png" alt="" />
            </span>
            <span className="pro-brand-copy">
              <strong>SFI CUSAT</strong>
              <small>Student Platform</small>
            </span>
          </a>

          <div className="pro-nav-links desktop-links" aria-label="Main navigation">
            {primary.map(([key, label, href]) => (
              <a key={key} href={href} className={key === "ai" ? "pro-ai-link" : ""}>
                {icons[key]}<span>{label}</span>
              </a>
            ))}
          </div>

          <div className="pro-nav-actions">
            <a className="pro-icon-button" href="/search" aria-label="Search">
              <Search size={19} aria-hidden="true" />
            </a>
            <a className="pro-signin desktop-sign" href="/sign-in">Sign in</a>
            <button
              className="pro-menu-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="pro-mobile-menu">
            <div className="shell">
              {primary.map(([key, label, href]) => (
                <a key={key} href={href} onClick={() => setOpen(false)}>
                  <span>{icons[key]}{label}</span><span>›</span>
                </a>
              ))}
              <a href="/sign-in" onClick={() => setOpen(false)}>
                <span>Sign in</span><span>›</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <nav className="pro-bottom-nav" aria-label="Mobile navigation">
        {primary.slice(0, 5).map(([key, label, href]) => (
          <a key={key} href={href} className={key === "ai" ? "pro-bottom-ai" : ""}>
            <span>{icons[key]}</span>
            <small>{key === "scholarx" ? "Explore" : label.replace("Study AI", "AI")}</small>
          </a>
        ))}
      </nav>
    </header>
  );
}
