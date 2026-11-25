import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageShell from "./components/PageShell";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Droplets,
  LifeBuoy,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

export const metadata: Metadata = pageMetadata(
  "SFI CUSAT Student Platform for Campus Life and Resources",
  "Explore student resources, support, opportunities and campus initiatives for CUSAT students through the SFI CUSAT digital platform.",
  "/",
);

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SFI CUSAT Digital Student Platform",
  url: "https://sficusatapp.vercel.app",
};

const services: Array<[string, string, string, ReactNode]> = [
  ["Learn", "Notes, question papers and academic resources.", "/resources", <BookOpen size={21} />],
  ["Student Support", "Academic, hostel and student helpdesk services.", "/support", <LifeBuoy size={21} />],
  ["SCHOLARX", "Scholarships, internships, jobs and fellowships.", "/opportunities", <BriefcaseBusiness size={21} />],
  ["Study AI", "Ask questions with your programme and semester context.", "/ai", <Sparkles size={21} />],
];

const initiatives: Array<[string, string, string, string]> = [
  ["Aashraya", "Blood donation support", "Request blood, register as a donor or find donation camps.", "/aashraya"],
  ["Sahayi", "Scribe & accessibility support", "Request a scribe or join the volunteer network.", "/sahayi"],
  ["Samskara", "Culture & creativity", "Events, competitions, magazine, gallery and volunteers.", "/samskara"],
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <PageShell>
        <section className="reference-hero">
          <div className="shell">
            <span className="reference-pill">SFI CUSAT · Digital Student Platform</span>
            <h1>Everything you need for <em>campus life.</em></h1>
            <p>
              A single student-first place for learning, support, opportunities and
              community services across CUSAT.
            </p>

            <form className="reference-search" action="/search">
              <Search size={18} aria-hidden="true" />
              <input name="q" aria-label="Search the platform" placeholder="Search notes, services, departments, scholarships…" />
              <span className="reference-search-shortcut" aria-hidden="true">⌘ K</span>
            </form>

            <div className="reference-tags">
              <span>Department-aware</span>
              <span>Mobile first</span>
              <span>English · മലയാളം</span>
            </div>
          </div>
        </section>

        <div className="shell reference-main">
          <a className="reference-sos" href="/aashraya/request">
            <span className="sos-title"><Droplets size={17} aria-hidden="true" /> Need blood urgently?</span>
            <span>Post a request to Aashraya <ArrowRight size={16} aria-hidden="true" /></span>
          </a>

          <section className="reference-section" aria-labelledby="services-title">
            <div className="reference-section-head">
              <div>
                <h2 id="services-title">What do you need?</h2>
                <p>Start with a service instead of navigating a complicated menu.</p>
              </div>
              <a className="reference-text-link" href="/search" aria-label="Search all resources"><Search size={14} aria-hidden="true" /> Search all <ArrowRight size={14} aria-hidden="true" /></a>
            </div>

            <div className="reference-grid">
              {services.map(([title, description, href, icon]) => (
                <a className="reference-card" href={href} key={title}>
                  <span className="reference-card-icon" aria-hidden="true">{icon}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="reference-card-link">Open <ArrowRight size={14} aria-hidden="true" /></span>
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
                  <span className="reference-card-link">Open module <ArrowRight size={14} aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </section>

          <section className="reference-section">
            <div className="reference-quick">
              <div>
                <span className="reference-pill"><Sparkles size={13} aria-hidden="true" /> Personal student space</span>
                <h2>Set up your academic profile</h2>
                <p>
                  Save your department, programme, scheme and semester once. The
                  platform can then use that context across resources, support and AI.
                </p>
                <div className="reference-actions">
                  <a className="reference-button primary" href="/profile"><UserRound size={15} aria-hidden="true" /> Set up profile</a>
                  <a className="reference-button" href="/resources"><BookOpen size={15} aria-hidden="true" /> Find resources</a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </>
  );
}
