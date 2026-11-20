"use client";

import PageShell from "../components/PageShell";
import { api } from "@/lib/convex-api";
import { useQuery } from "convex/react";

const actions = [
  ["Find notes", "/resources"],
  ["Browse opportunities", "/opportunities"],
  ["Academic helpdesk", "/support/helpdesk/academic"],
  ["Open scholarships", "/scholarships"],
];

export default function Dashboard() {
  const profile = useQuery(api.platform.myAcademicProfile);
  const academicLabel = profile?.programme
    ? profile.programme + (profile.semester ? " · Semester " + profile.semester : "")
    : "Complete your academic profile";

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Student Dashboard</div>
          <h1>Your campus, <em>your dashboard.</em></h1>
          {profile ? (
            <p>Welcome back, {profile.fullName}. Your academic context is now connected to the platform.</p>
          ) : (
            <p>Set your programme, semester and scheme once. The platform can then personalise resources, opportunities and support for you.</p>
          )}
          <div className="actions">
            <a className="btn primary" href="/profile">Set up academic profile</a>
            <a className="btn" href="/search">Search everything</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="grid4">
            <div className="stat"><b>{profile?.semester ?? "—"}</b><span>Current semester</span></div>
            <div className="stat"><b>{profile?.scheme ?? "—"}</b><span>Scheme</span></div>
            <div className="stat"><b>AI</b><span>Academic assistant</span></div>
            <div className="stat"><b>24/7</b><span>Student services</span></div>
          </div>

          <div className="grid2" style={{ marginTop: 18 }}>
            <div className="card">
              <span className="chip">My academics</span>
              <h3 style={{ marginTop: 12 }}>{academicLabel}</h3>
              <p>{profile?.departmentId ? "Your department context is saved and can drive future academic filtering." : "Choose your programme, department, semester and scheme to unlock personalised academic resources."}</p>
              <div className="list" style={{ marginTop: 12 }}>
                <a className="listitem" href="/resources"><strong>Notes & question papers</strong><span>→</span></a>
                <a className="listitem" href="/support/helpdesk/academic"><strong>Academic Helpdesk</strong><span>→</span></a>
                <a className="listitem" href="/scholarships"><strong>Scholarship opportunities</strong><span>→</span></a>
              </div>
            </div>

            <div className="card">
              <span className="chip">Quick actions</span>
              <h3 style={{ marginTop: 12 }}>What do you want to do?</h3>
              <div className="list">
                {actions.map(([title, href]) => (
                  <a className="listitem" href={href} key={title}><strong>{title}</strong><span>→</span></a>
                ))}
              </div>
            </div>
          </div>

          <div className="notice" style={{ marginTop: 18 }}>
            <div className="icon" style={{ margin: 0 }}>i</div>
            <div>
              <strong>Student OS foundation is live</strong>
              <p>Your existing resources, helpdesk, scholarship, opportunities and student initiatives remain separate modules, but they can now converge around one academic profile and dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
