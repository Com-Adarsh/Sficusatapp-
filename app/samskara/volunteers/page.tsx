"use client";
import PageShell from "../../components/PageShell";
import {useState} from "react";

export default function Volunteers(){
 const[s,setS]=useState(false);
 return <PageShell><section className="hero compact form-hero"><div className="shell">
  <div className="eyebrow">Samskara · Volunteers</div><h1>Be part of the <em>team.</em></h1><p>Join cultural event teams, production support and volunteer shifts. Tell the cultural team what you can contribute.</p>
  <div className="form-hero-meta"><span>✦ Event support</span><span>✦ Media & production</span><span>✦ Creative roles</span></div>
 </div></section>
 {s?<div className="shell"><div className="form-success"><div className="form-success-icon">✓</div><h2>Welcome to the <em>team.</em></h2><p>Your volunteer interest has been recorded in demo mode. Coordinator review and shift assignment will be handled by the backend.</p><div className="actions"><a className="btn primary" href="/samskara">Back to Samskara</a><button className="btn" onClick={()=>setS(false)}>Join again</button></div></div></div>:
 <section className="form-section"><div className="shell form-layout"><div className="form-card"><div className="form-card-head"><div className="form-card-icon">✦</div><div><small>Step 1 · Volunteer profile</small><h2>Show us what you can bring</h2><p>Roles, availability and skills help the team find the right fit.</p></div></div>
 <form className="polished-form" onSubmit={e=>{e.preventDefault();setS(true)}}><div className="polished-grid">
  <label className="polished-field"><span>Full name <b>*</b></span><input required placeholder="Your full name"/></label>
  <label className="polished-field"><span>Department / programme <b>*</b></span><input required placeholder="e.g. Integrated M.Sc. Statistics"/></label>
  <label className="polished-field"><span>Preferred role</span><select><option>Event support</option><option>Media</option><option>Stage / production</option><option>Design</option></select></label>
  <label className="polished-field"><span>Availability</span><input placeholder="e.g. evenings / weekends"/></label>
  <label className="polished-field full"><span>Skills / interests</span><textarea rows={5} placeholder="Tell the cultural team what you can contribute"/></label>
 </div><div className="form-actions"><div className="form-note"><strong>✦</strong><span>Choose the role where you can contribute most comfortably.</span></div><button className="btn primary">Join volunteer pool →</button></div></form>
 </div><aside className="form-aside"><div className="form-aside-card"><div className="form-aside-number">SAMS­KARA VOLUNTEERS</div><h3>There is a role for every skill.</h3><p>Event support, media, production and design all need student volunteers.</p><div className="form-aside-list"><div><i>1</i> Pick a preferred role</div><div><i>2</i> Share availability</div><div><i>3</i> Join the volunteer pool</div></div></div></aside></div></section>}
 </PageShell>
}