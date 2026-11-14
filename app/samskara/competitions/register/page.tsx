"use client";
import PageShell from "../../../components/PageShell";
import {useState} from "react";

export default function Register(){
 const[s,setS]=useState(false);
 return <PageShell><section className="hero compact form-hero"><div className="shell">
  <div className="eyebrow">Samskara · Competition Registration</div><h1>Register to <em>participate.</em></h1><p>Choose your competition, tell us who is participating and submit your registration. Eligibility will be enforced by the backend.</p>
  <div className="form-hero-meta"><span>★ Student competitions</span><span>★ Individual & team</span><span>★ Registration tracking</span></div>
 </div></section>
 {s?<div className="shell"><div className="form-success"><div className="form-success-icon">✓</div><h2>Registration <em>submitted.</em></h2><p>Demo registration ID: SAM-DEMO-001. Keep this ID for future updates.</p><div className="actions"><a className="btn primary" href="/samskara/competitions">Back to competitions</a><button className="btn" onClick={()=>setS(false)}>Register again</button></div></div></div>:
 <section className="form-section"><div className="shell form-layout"><div className="form-card"><div className="form-card-head"><div className="form-card-icon">★</div><div><small>Step 1 · Participant details</small><h2>Choose your competition</h2><p>Complete the registration in a few simple steps.</p></div></div>
 <form className="polished-form" onSubmit={e=>{e.preventDefault();setS(true)}}><div className="polished-grid">
  <label className="polished-field"><span>Competition</span><select><option>Literary Competition</option><option>Music Competition</option><option>Visual Arts</option></select></label>
  <label className="polished-field"><span>Participation</span><select><option>Individual</option><option>Team</option></select></label>
  <label className="polished-field"><span>Full name <b>*</b></span><input required placeholder="Your full name"/></label>
  <label className="polished-field"><span>Email <b>*</b></span><input type="email" required placeholder="you@example.com"/></label>
  <label className="polished-field full"><span>Team members</span><textarea rows={4} placeholder="Optional for team entries — add names separated by commas"/></label>
 </div><div className="form-actions"><div className="form-note"><strong>★</strong><span>Use the same name and email you will use for event communication.</span></div><button className="btn primary">Submit registration →</button></div></form>
 </div><aside className="form-aside"><div className="form-aside-card"><div className="form-aside-number">REGISTRATION FLOW</div><h3>Choose → enter → submit.</h3><p>Your final registration ID and eligibility checks will be handled by the backend.</p><div className="form-aside-list"><div><i>1</i> Choose competition</div><div><i>2</i> Add participant details</div><div><i>3</i> Save registration ID</div></div></div></aside></div></section>}
 </PageShell>
}