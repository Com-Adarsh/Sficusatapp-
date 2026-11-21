"use client";

import PageShell from "../components/PageShell";
import { api } from "@/lib/convex-api";
import { useQuery } from "convex/react";
import { ArrowRight, BookOpen, BriefcaseBusiness, LifeBuoy, Sparkles, UserRound } from "lucide-react";

const actions = [
  ["Ask Study AI", "/ai", <Sparkles size={18} />],
  ["Find notes", "/resources", <BookOpen size={18} />],
  ["Opportunities", "/opportunities", <BriefcaseBusiness size={18} />],
  ["Academic helpdesk", "/support/helpdesk/academic", <LifeBuoy size={18} />],
];

export default function Dashboard() {
  const profile = useQuery(api.platform.myAcademicProfile);
  const academicLabel = profile?.programme
    ? profile.programme + (profile.semester ? " · Semester " + profile.semester : "")
    : "Complete your academic profile";

  return (
    <PageShell>
      <section className="pro-dashboard-hero">
        <div className="shell">
          <div className="pro-dashboard-top">
            <div>
              <span className="pro-overline">Student dashboard</span>
              <h1>{profile?.fullName ? <>Good to see you, <em>{profile.fullName.split(" ")[0]}.</em></> : <>Your <em>student workspace.</em></>}</h1>
              <p>{profile?.programme ? academicLabel : "Set your academic profile once to personalise the platform."}</p>
            </div>
            <a className="pro-avatar pro-avatar-large" href="/profile" aria-label="Open profile"><UserRound size={22}/></a>
          </div>
          {!profile?.programme && (
            <a className="pro-profile-prompt" href="/profile">
              <span className="pro-prompt-icon"><UserRound size={19}/></span>
              <span><strong>Complete your academic profile</strong><small>Department, programme, semester and scheme</small></span>
              <ArrowRight size={17}/>
            </a>
          )}
        </div>
      </section>

      <main className="shell pro-main pro-dashboard-main">
        <section className="pro-section">
          <div className="pro-section-head"><div><span className="pro-overline">Quick access</span><h2>What are you working on?</h2></div></div>
          <div className="pro-action-grid">
            {actions.map(([title, href, icon]) => (
              <a href={href as string} key={title as string} className="pro-action-card">
                <span className="pro-action-icon">{icon}</span><span><strong>{title}</strong><small>Open module</small></span><ArrowRight size={16}/>
              </a>
            ))}
          </div>
        </section>

        <section className="pro-section">
          <div className="pro-section-head"><div><span className="pro-overline">My academics</span><h2>Your academic snapshot</h2></div><a href="/profile">Edit <ArrowRight size={15}/></a></div>
          <div className="pro-academic-grid">
            <div className="pro-academic-main">
              <div className="pro-academic-badge">ACADEMIC PROFILE</div>
              <h3>{academicLabel}</h3>
              <p>{profile?.departmentId ? "Your department and programme context can power personalised resources and future AI study tools." : "Choose your department, programme, semester and scheme to unlock personalised academic features."}</p>
              <div className="pro-meta-row">
                <span><b>{profile?.semester ?? "—"}</b>Semester</span>
                <span><b>{profile?.year ?? "—"}</b>Year</span>
                <span><b>{profile?.scheme ?? "—"}</b>Scheme</span>
              </div>
            </div>
            <div className="pro-academic-side">
              <span className="pro-side-icon"><Sparkles size={20}/></span>
              <strong>Study AI</strong>
              <p>Ask questions with your programme and semester context.</p>
              <a href="/ai">Open assistant <ArrowRight size={15}/></a>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
