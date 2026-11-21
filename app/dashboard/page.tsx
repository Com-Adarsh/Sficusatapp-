"use client";

import PageShell from "../components/PageShell";
import { api } from "@/lib/convex-api";
import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, BriefcaseBusiness, CircleHelp, GraduationCap, Search, Sparkles } from "lucide-react";

const actions = [
  ["Ask Study AI", "/ai", Sparkles],
  ["Find notes & PYQs", "/resources", BookOpen],
  ["Academic Helpdesk", "/support/helpdesk/academic", CircleHelp],
  ["Scholarships", "/scholarships", GraduationCap],
  ["Opportunities", "/opportunities", BriefcaseBusiness],
  ["Search campus", "/search", Search],
] as const;

export default function Dashboard() {
  const profile = useQuery(api.platform.myAcademicProfile);
  const academicLabel = profile?.programme
    ? profile.programme + (profile.semester ? " · Semester " + profile.semester : "")
    : "Complete your academic profile";

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Student dashboard</div>
          <h1>Your campus, <em>in one place.</em></h1>
          <p>
            Your academic profile connects the services you use most — learning,
            support, opportunities and student initiatives.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 10 }}>
        <div className="shell">
          <div className="dashboard-pro">
            <div className="dashboard-welcome">
              <div className="eyebrow">Welcome back</div>
              <h2>{profile?.fullName || "CUSAT student"}</h2>
              <p>
                {profile?.programme
                  ? "Your academic context is ready. Use the shortcuts below to continue where you left off."
                  : "Set up your academic profile once to make resources, helpdesk and future AI features more relevant to you."}
              </p>

              <div className="dashboard-profile">
                <div className="dashboard-avatar">
                  {(profile?.fullName || "C").trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <small>Academic profile</small>
                  <strong>{academicLabel}</strong>
                </div>
              </div>

              <div className="actions" style={{ marginTop: 17 }}>
                <a className="btn primary" href="/profile">
                  {profile?.programme ? "Edit profile" : "Set up profile"} <ArrowRight size={15} />
                </a>
                <a className="btn" href="/ai">Open Study AI</a>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-head">
                <div>
                  <h3>Academic context</h3>
                  <p>Used to personalise your student experience.</p>
                </div>
                <a href="/profile" className="reference-text-link">Edit</a>
              </div>

              <div className="dashboard-profile-grid">
                <div className="dashboard-mini">
                  <span>Programme</span>
                  <strong>{profile?.programme || "Not set"}</strong>
                </div>
                <div className="dashboard-mini">
                  <span>Semester</span>
                  <strong>{profile?.semester ? "Semester " + profile.semester : "Not set"}</strong>
                </div>
                <div className="dashboard-mini">
                  <span>Scheme</span>
                  <strong>{profile?.scheme || "Not set"}</strong>
                </div>
              </div>

              <div className="dashboard-foundation">
                <strong>One profile. Many services.</strong>
                <p>These details can power department-aware resources, helpdesk routing and subject-specific Study AI without repeatedly asking you for the same information.</p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel" style={{ marginTop: 16 }}>
            <div className="dashboard-panel-head">
              <div>
                <h3>Quick actions</h3>
                <p>Common student tasks, without digging through menus.</p>
              </div>
            </div>
            <div className="dashboard-action-grid">
              {actions.map(([title, href, Icon]) => (
                <a className="dashboard-action" href={href} key={title}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="icon" style={{ width: 34, height: 34, margin: 0 }}>
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <strong>{title}</strong>
                  </span>
                  <span><ArrowRight size={16} aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
