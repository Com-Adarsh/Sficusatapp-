"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CircleUserRound,
  Home,
  LifeBuoy,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const primary = [
  ["home", "Home", "/"],
  ["learn", "Learn", "/resources"],
  ["ai", "Study AI", "/ai"],
  ["support", "Support", "/support"],
  ["scholarx", "SCHOLARX", "/opportunities"],
  ["profile", "Profile", "/profile"],
];

const icons: Record<string, React.ReactNode> = {
  home: <Home size={16} aria-hidden="true" />,
  learn: <BookOpen size={16} aria-hidden="true" />,
  ai: <Sparkles size={16} aria-hidden="true" />,
  support: <LifeBuoy size={16} aria-hidden="true" />,
  scholarx: <Sparkles size={16} aria-hidden="true" />,
  profile: <CircleUserRound size={16} aria-hidden="true" />,
};

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <header className="reference-header">
      <nav className="nav">
        <div className="shell navin">
          <a className="brand" href="/" aria-label="SFI CUSAT Digital Student Platform home">
            <img
              src="/logos/sfi-cusat.png"
              alt="SFI CUSAT logo"
              style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 10, flexShrink: 0 }}
            />
            <span>
              SFI CUSAT
              <small>Digital Student Platform</small>
            </span>
          </a>

          <div className="links reference-links desktop-links" aria-label="Main navigation">
            {primary.map(([key, label, href]) => (
              <a key={key} href={href}>
                <span className="nav-icon">{icons[key]}</span>
                {label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a className="icon-btn reference-icon" href="/search" aria-label="Search the platform">
              <Search size={17} aria-hidden="true" />
            </a>
            {signedIn ? <button className="btn primary desktop-sign reference-sign" type="button" onClick={signOut}>Sign out</button> : <a className="btn primary desktop-sign reference-sign" href="/sign-in">Sign in</a>}
            <button
              className="menu-btn"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mobile-menu reference-mobile-menu">
            <div className="shell">
              {primary.map(([key, label, href]) => (
                <a key={key} href={href} onClick={() => setOpen(false)}>
                  <span>{icons[key]}{label}</span>
                  <span>→</span>
                </a>
              ))}
              <a href="/sign-in" onClick={() => setOpen(false)}>
                Sign in <span>→</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <nav className="mobilebar reference-mobilebar" aria-label="Mobile navigation">
        {[
          primary[0],
          primary[1],
          primary[2],
          primary[3],
          primary[5],
        ].map(([key, label, href]) => (
          <a key={key} href={href}>
            <b>{icons[key]}</b>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
