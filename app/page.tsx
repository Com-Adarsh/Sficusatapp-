import PageShell from "./components/PageShell";
import ModuleLogo from "./components/ModuleLogo";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  Droplets,
  LifeBuoy,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

const services: Array<[string, string, string, ReactNode]> = [
  ["Learn", "Notes, question papers and academic resources.", "/resources", <BookOpen key="learn" size={21} />],
  ["Student Support", "Academic, hostel and student helpdesk services.", "/support", <LifeBuoy key="support" size={21} />],
  ["SCHOLARX", "Scholarships, internships, jobs and fellowships.", "/opportunities", <BriefcaseBusiness key="scholarx" size={21} />],
  ["Study AI", "Ask questions with your programme and semester context.", "/ai", <Sparkles key="ai" size={21} />],
];

const initiatives: Array<[string, string, string, string]> = [
  ["Aashraya", "Blood donation support", "Request blood, register as a donor or find donation camps.", "/aashraya"],
  ["Sahayi", "Scribe & accessibility support", "Request a scribe or join the volunteer network.", "/sahayi"],
  ["Samskara", "Culture & creativity", "Events, competitions, magazine, gallery and volunteers.", "/samskara"],
];

export default function Home() {
  return (
    <PageShell>
      <section className="reference-hero">
        <div className="shell">
          <span className="reference-pill">SFI CUSAT · Digital Student Platform</span>
          <h1>Everything you need for <em>campus life.</em></h1>
          <p>
            A single student-first place for learning, support, opportunities and
            community services across CUSAT.
          </p>

          <div className="reference-search">
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search the platform" placeholder="Search notes, services, departments, scholarships…" />
            <span style={{ marginLeft: "auto", color: "#8a929c", fontSize: 11 }}>⌘ K</span>
          </div>

          <div className="reference-tags">
            <span>Department-aware</span>
            <span>Mobile first</span>
            <span>English · മലയാളം</span>
          </div>
        </div>
      </section>

      <main className="shell reference-main">
        <a className="reference-sos" href="/aashraya/request">
          <span className="sos-title"><Droplets size={17} /> Need blood urgently?</span>
          <span>Post a request to Aashraya <ArrowRight size={16} /></span>
        </a>

        <section className="reference-section" aria-labelledby="services-title">
          <div className="reference-section-head">
            <div>
              <h2 id="services-title">What do you need?</h2>
              <p>Start with a service instead of navigating a complicated menu.</p>
            </div>
            <a className="reference-text-link" href="/search">Search all <ArrowRight size={14} /></a>
          </div>

          <div className="reference-grid">
            {services.map(([title, description, href, icon]) => (
              <a className="reference-card" href={href} key={title}>
                {title === "SCHOLARX" ? (
                  <ModuleLogo type="scholarx" size="sm" />
                ) : (
                  <span className="reference-card-icon">{icon}</span>
                )}
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="reference-card-link">Open <ArrowRight size={14} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="reference-section" aria-labelledby="initiatives-title">
          <div className="reference-section-head">
            <div>
              <h2 id="initiatives-title">Student initiatives</h2>
              <p>Useful campus services, presented as clear modules.</p>
            </div>
          </div>

          <div className="reference-grid">
            {initiatives.map(([name, title, description, href]) => (
              <a
                className={`reference-card reference-initiative ${name === "Sahayi" ? "reference-teal" : name === "Samskara" ? "reference-amber" : ""}`}
                href={href}
                key={name}
              >
                <span className="reference-module">{name}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="reference-card-link">Open module <ArrowRight size={14} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="reference-section">
          <div className="reference-quick">
            <div>
              <span className="reference-pill"><Sparkles size={13} /> Personal student space</span>
              <h2>Set up your academic profile</h2>
              <p>
                Save your department, programme, scheme and semester once. The
                platform can then use that context across resources, support and AI.
              </p>
              <div className="reference-actions">
                <a className="reference-button primary" href="/profile"><UserRound size={15} /> Set up profile</a>
                <a className="reference-button" href="/resources"><BookOpen size={15} /> Find resources</a>
              </div>
            </div>
            <div className="reference-note">
              <ShieldCheck size={19} />
              <div>
                <strong>Student-run platform</strong>
                <p>Run by SFI CUSAT. Not an official website of Cochin University of Science and Technology.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
