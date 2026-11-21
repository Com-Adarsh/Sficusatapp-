import PageShell from "./components/PageShell";
import ModuleLogo from "./components/ModuleLogo";
import { ArrowRight, BookOpen, BriefcaseBusiness, LifeBuoy, Search, Sparkles, Droplets, Accessibility, Palette, Bell } from "lucide-react";
import type { ReactNode } from "react";

const services: Array<{title:string; description:string; href:string; icon:ReactNode; tone:string}> = [
  { title:"Learn", description:"Notes, PYQs, syllabus and verified academic resources.", href:"/resources", icon:<BookOpen size={21} />, tone:"blue" },
  { title:"Study AI", description:"Ask questions, understand concepts and study with context.", href:"/ai", icon:<Sparkles size={21} />, tone:"violet" },
  { title:"Support", description:"Academic, hostel and student support in one place.", href:"/support", icon:<LifeBuoy size={21} />, tone:"green" },
  { title:"Explore", description:"Scholarships, internships, jobs and opportunities.", href:"/opportunities", icon:<BriefcaseBusiness size={21} />, tone:"amber" },
];

const initiatives = [
  { name:"Aashraya", title:"Blood donation", description:"Request blood, register as a donor or find support.", href:"/aashraya", icon:<Droplets size={21} />, tone:"red" },
  { name:"Sahayi", title:"Accessibility", description:"Request a scribe or join the volunteer network.", href:"/sahayi", icon:<Accessibility size={21} />, tone:"teal" },
  { name:"Samskara", title:"Culture & creativity", description:"Discover events, competitions, magazine and volunteers.", href:"/samskara", icon:<Palette size={21} />, tone:"purple" },
];

export default function Home() {
  return (
    <PageShell>
      <section className="pro-home-hero">
        <div className="shell">
          <div className="pro-welcome-row">
            <div>
              <span className="pro-kicker"><span className="pro-status-dot" /> Student-run platform</span>
              <h1>Everything you need for <em>CUSAT.</em></h1>
              <p>Study smarter, get support, discover opportunities and access student initiatives from one place.</p>
            </div>
            <a className="pro-avatar-link" href="/profile" aria-label="Open profile"><CircleUser /></a>
          </div>

          <a className="pro-search" href="/search">
            <Search size={19} aria-hidden="true" />
            <span>Search notes, services, opportunities…</span>
            <kbd>⌘ K</kbd>
          </a>

          <div className="pro-quick-strip">
            <a href="/ai"><Sparkles size={17} /><span>Ask AI</span></a>
            <a href="/resources"><BookOpen size={17} /><span>Find notes</span></a>
            <a href="/aashraya/request"><Droplets size={17} /><span>Need blood</span></a>
            <a href="/support"><LifeBuoy size={17} /><span>Get help</span></a>
          </div>
        </div>
      </section>

      <main className="shell pro-main">
        <section className="pro-section">
          <div className="pro-section-head">
            <div><span className="pro-overline">Core services</span><h2>What do you need?</h2></div>
            <a href="/search">View all <ArrowRight size={15} /></a>
          </div>
          <div className="pro-service-grid">
            {services.map((service) => (
              <a className={`pro-service-card pro-tone-${service.tone}`} href={service.href} key={service.title}>
                <span className="pro-service-icon">{service.icon}</span>
                <div><h3>{service.title}</h3><p>{service.description}</p></div>
                <span className="pro-card-arrow"><ArrowRight size={16} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="pro-feature-card">
          <div className="pro-feature-copy">
            <span className="pro-overline">Study smarter</span>
            <h2>Your academic context, connected.</h2>
            <p>Save your CUSAT department, programme and semester once. Resources, AI and future student services can use that context automatically.</p>
            <div className="pro-feature-actions">
              <a className="pro-button pro-button-primary" href="/profile">Set up profile <ArrowRight size={16}/></a>
              <a className="pro-button pro-button-light" href="/resources">Browse resources</a>
            </div>
          </div>
          <div className="pro-feature-art" aria-hidden="true"><Sparkles size={54}/><span>Academic<br/>workspace</span></div>
        </section>

        <section className="pro-section">
          <div className="pro-section-head">
            <div><span className="pro-overline">Student life</span><h2>Built around students</h2></div>
          </div>
          <div className="pro-initiative-grid">
            {initiatives.map((item) => (
              <a className={`pro-initiative-card pro-init-${item.tone}`} href={item.href} key={item.name}>
                <div className="pro-initiative-top"><span className="pro-service-icon">{item.icon}</span><ArrowRight size={17}/></div>
                <span className="pro-initiative-label">{item.name}</span>
                <h3>{item.title}</h3><p>{item.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="pro-trust">
          <div className="pro-trust-icon"><Bell size={19}/></div>
          <div><strong>Student-run, not an official CUSAT website.</strong><p>SFI CUSAT maintains this platform for student services and initiatives. Official university decisions and notices remain with CUSAT.</p></div>
        </section>
      </main>
    </PageShell>
  );
}

function CircleUser() {
  return <span style={{display:"grid",placeItems:"center"}}><span className="pro-avatar">S</span></span>;
}
