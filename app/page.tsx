import PageShell from "./components/PageShell";
import ModuleLogo from "./components/ModuleLogo";
import { ArrowRight, BookOpen, BriefcaseBusiness, LifeBuoy, Search, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const services: Array<[string,string,string,ReactNode]> = [
  ["Abhimanyu Learning Space", "Notes, question papers and verified academic resources.", "/resources", <BookOpen size={24} />],
  ["SCHOLARX", "Scholarships, internships, jobs and fellowships.", "/opportunities", <BriefcaseBusiness size={24} />],
  ["Student Support", "Helpdesk, grievances, issues and interventions.", "/support", <LifeBuoy size={24} />],
];

const initiatives: Array<[string,string,string,string,string]> = [
  ["Aashraya", "Blood donation support", "Request blood, register as a donor or find donation camps.", "/aashraya", "red"],
  ["Sahayi", "Scribe & accessibility support", "Request a scribe or join the volunteer network.", "/sahayi", "teal"],
  ["Samskara", "Culture & creativity", "Events, competitions, magazine, gallery and volunteers.", "/samskara", "amber"],
];

export default function Home() {
  return (
    <PageShell>
      <section className="reference-hero"><div className="shell">
        <span className="reference-pill">A student initiative of SFI CUSAT</span>
        <h1>One student platform for every <em>campus service.</em></h1>
        <p>Find study material, ask for blood or a scribe, discover scholarships and get help with hostel or academic problems — all from your phone.</p>
        <div className="reference-search"><Search size={19} aria-hidden="true" /><input aria-label="Search services" placeholder="Search services, notes, blood, hostel..." /></div>
        <div className="reference-tags"><span>Mobile first</span><span>English · മലയാളം</span><span>Open to all CUSAT students</span></div>
      </div></section>
      <main className="shell reference-main">
        <a className="reference-sos" href="/aashraya/request"><span className="sos-title">🩸 Need blood urgently?</span><span>Post a request to Aashraya <ArrowRight size={17} aria-hidden="true" /></span></a>
        <section className="reference-section" aria-labelledby="start-title">
          <div className="reference-section-head"><div><h2 id="start-title">Start with what you need</h2><p>Clear entry points instead of a maze of menus.</p></div><a className="reference-text-link" href="/search">Search everything <ArrowRight size={15} /></a></div>
          <div className="reference-grid">{services.map(([title, description, href, icon]) => <a className="reference-card" href={href} key={title}>{title === "SCHOLARX" ? <ModuleLogo type="scholarx" size="sm" /> : <span className="reference-card-icon">{icon}</span>}<h3>{title}</h3><p>{description}</p><span className="reference-card-link">Explore <ArrowRight size={15} /></span></a>)}</div>
        </section>
        <section className="reference-section" aria-labelledby="initiatives-title">
          <div className="reference-section-head"><div><h2 id="initiatives-title">Student initiatives</h2><p>Services are intended for all CUSAT students, regardless of affiliation.</p></div></div>
          <div className="reference-grid">{initiatives.map(([name, title, description, href, tone]) => <a className={`reference-card reference-initiative reference-${tone}`} href={href} key={name}><span className="reference-module">{name}</span><h3>{title}</h3><p>{description}</p><span className="reference-card-link">Open module <ArrowRight size={15} /></span></a>)}</div>
        </section>
        <section className="reference-section"><div className="reference-quick"><div><span className="reference-pill">Quick actions</span><h2>Get there in one tap</h2><p>Keep the most common student tasks close at hand.</p><div className="reference-actions"><a className="reference-button primary" href="/aashraya/request">Request Blood</a><a className="reference-button" href="/sahayi/request">Request a Scribe</a><a className="reference-button" href="/resources">Find Notes</a></div></div><div className="reference-note"><ShieldCheck size={20} /><div><strong>Run by SFI CUSAT</strong><p>This is a student-run platform, not an official website of Cochin University of Science and Technology.</p></div></div></div></section>
      </main>
    </PageShell>
  );
}
