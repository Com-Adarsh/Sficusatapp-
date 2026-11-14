"use client";
import PageShell from "../../components/PageShell";
import {useState} from "react";

export default function Request(){
 const[s,setS]=useState(false);
 return <PageShell><section className="hero compact form-hero"><div className="shell">
  <div className="eyebrow">Sahayi · Request Support</div><h1>Request a <em>scribe.</em></h1><p>Share only the information needed to coordinate exam support. Your accessibility information stays private and is used only for matching.</p>
  <div className="form-hero-meta"><span>◎ Privacy first</span><span>◎ Coordinator matching</span><span>◎ Exam support</span></div>
 </div></section>
 {s?<div className="shell"><div className="form-success"><div className="form-success-icon">✓</div><h2>Request received in <em>demo mode.</em></h2><p>Demo request ID: SAHAYI-DEMO-001. A coordinator can review and match the request once persistence is connected.</p><div className="actions"><a className="btn primary" href="/sahayi/request/demo">View request</a><button className="btn" onClick={()=>setS(false)}>Submit another</button></div></div></div>:
 <section className="form-section"><div className="shell form-layout"><div className="form-card"><div className="form-card-head"><div className="form-card-icon">✎</div><div><small>Step 1 · Exam details</small><h2>Tell us about the exam</h2><p>Only include information needed to arrange the scribe support.</p></div></div>
 <form className="polished-form" onSubmit={e=>{e.preventDefault();setS(true)}}><div className="polished-grid">
  <label className="polished-field"><span>Course / programme <b>*</b></span><input required placeholder="Course or programme"/></label>
  <label className="polished-field"><span>Paper / subject <b>*</b></span><input required placeholder="Paper or subject"/></label>
  <label className="polished-field"><span>Exam date <b>*</b></span><input type="date" required/></label>
  <label className="polished-field"><span>Exam time <b>*</b></span><input type="time" required/></label>
  <label className="polished-field"><span>Duration</span><input placeholder="e.g. 3 hours"/></label>
  <label className="polished-field"><span>Venue</span><input placeholder="Exam venue"/></label>
  <label className="polished-field"><span>Language</span><select><option>English</option><option>Malayalam</option><option>Other</option></select></label>
  <label className="polished-field full"><span>Special requirements</span><textarea rows={5} maxLength={1000} placeholder="Only information needed to arrange support"/></label>
 </div><div className="form-actions"><div className="form-note"><strong>Privacy first</strong><span>Share only the minimum information required for coordination.</span></div><button className="btn primary">Submit support request →</button></div></form>
 </div><aside className="form-aside"><div className="form-aside-card"><div className="form-aside-number">SUPPORT FLOW</div><h3>From request to match.</h3><p>Sahayi coordinators review the request and arrange a suitable volunteer.</p><div className="form-aside-list"><div><i>1</i> Submit exam details</div><div><i>2</i> Coordinator reviews</div><div><i>3</i> Scribe is matched</div></div></div></aside></div></section>}
 </PageShell>
}