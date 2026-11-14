"use client";

import { Accessibility, CheckCircle2, CircleAlert, Palette, Search, ShieldCheck } from "lucide-react";

const colors = [
  ["Primary", "var(--color-primary)"],
  ["Accent", "var(--color-accent)"],
  ["Abhimanyu", "var(--module-abhimanyu)"],
  ["SCHOLARX", "var(--module-scholarx)"],
  ["Aashraya", "var(--module-aashraya)"],
  ["Sahayi", "var(--module-sahayi)"],
  ["Samskara", "var(--module-samskara)"],
  ["Support", "var(--module-support)"],
];

export default function DesignSystemPage() {
  return (
    <main className="design-system">
      <div className="shell" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ maxWidth: 760, marginBottom: 32 }}>
          <span className="eyebrow"><Palette size={14} aria-hidden="true" /> Design system</span>
          <h1 style={{ fontSize: "clamp(32px,6vw,52px)", letterSpacing: "-.04em", margin: "14px 0 10px" }}>
            Warm, clear, student-first foundations.
          </h1>
          <p style={{ color: "var(--color-muted)", lineHeight: 1.7, margin: 0 }}>
            Phase 1 foundation for SFI CUSAT&apos;s student platform. Tokens and primitives are
            designed for mobile-first use, Malayalam expansion, accessibility, and slow networks.
          </p>
        </div>

        <section className="ds-card" aria-labelledby="colors">
          <h2 id="colors" style={{ marginTop: 0 }}>Color tokens</h2>
          <div className="grid4">
            {colors.map(([name, value]) => (
              <div key={name}>
                <div className="ds-swatch" style={{ background: value }}>{name}</div>
                <small style={{ color: "var(--color-muted)" }}>{value}</small>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 20 }} className="ds-card" aria-labelledby="controls">
          <h2 id="controls" style={{ marginTop: 0 }}>Controls & states</h2>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="ds-button ds-button-primary"><Search size={17} aria-hidden="true" /> Search</button>
            <button className="ds-button ds-button-secondary">Secondary</button>
            <button className="ds-button ds-button-ghost">Ghost</button>
            <button className="ds-button ds-button-danger">Danger</button>
          </div>
          <div className="grid2" style={{ marginTop: 20 }}>
            <label>
              <span style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 7 }}>Search resources</span>
              <input className="ds-control" style={{ width: "100%" }} placeholder="Notes, course code, subject..." aria-label="Search resources" />
            </label>
            <div>
              <span style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 7 }}>Badges</span>
              <div className="chips" style={{ marginTop: 0 }}>
                <span className="ds-badge ds-badge-blue"><ShieldCheck size={13} /> Verified</span>
                <span className="ds-badge ds-badge-green"><CheckCircle2 size={13} /> Success</span>
                <span className="ds-badge ds-badge-amber"><CircleAlert size={13} /> Closing soon</span>
                <span className="ds-badge ds-badge-rose"><Accessibility size={13} /> Support</span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 20 }} className="ds-card" aria-labelledby="rules">
          <h2 id="rules" style={{ marginTop: 0 }}>Core rules</h2>
          <div className="grid3">
            <div><strong>44px targets</strong><p style={{ color: "var(--color-muted)", lineHeight: 1.6 }}>Touch-friendly controls for one-hand mobile use.</p></div>
            <div><strong>Persistent labels</strong><p style={{ color: "var(--color-muted)", lineHeight: 1.6 }}>Labels stay visible; helper and error text never replace them.</p></div>
            <div><strong>Reduced motion</strong><p style={{ color: "var(--color-muted)", lineHeight: 1.6 }}>Motion is subtle and respects user preferences.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
