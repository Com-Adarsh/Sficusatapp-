"use client";
import PageShell from "../../components/PageShell";
import ModuleLogo from "../../components/ModuleLogo";
import {useState} from "react";

export default function SubmitOpportunity(){
 const[s,setS]=useState(false);
 return <PageShell><section className="hero compact form-hero"><div className="shell">
  <div className="module-brand-row"><ModuleLogo type="scholarx" size="md" /><div className="eyebrow">SCHOLARX · Verified Opportunity Submission</div></div><h1>Add a <em>job or internship.</em></h1>
  <p>Help students discover verified opportunities. Every submission goes through moderation before it becomes public.</p>
  <div className="form-hero-meta"><span>✓ Verified contributor access</span><span>✓ Moderator review</span><span>✓ Official link required</span></div>
 </div></section>
 {s?<div className="shell"><div className="form-success"><div className="form-success-icon">✓</div><h2>Submitted for <em>verification.</em></h2><p>Your opportunity is now in the moderation queue in demo mode.</p><div className="actions"><a className="btn primary" href="/opportunities">Back to SCHOLARX</a><button className="btn" onClick={()=>setS(false)}>Submit another</button></div></div></div>:
 <section className="form-section"><div className="shell form-layout"><div className="form-card">
  <div className="form-card-head"><div className="form-card-icon">✦</div><div><small>Step 1 · Opportunity details</small><h2>Make the opportunity clear</h2><p>Give students the information they need to decide whether to apply.</p></div></div>
  <form className="polished-form" onSubmit={e=>{e.preventDefault();setS(true)}}><div className="polished-grid">
   <label className="polished-field"><span>Opportunity type</span><select><option>Internship</option><option>Job</option></select></label>
   <label className="polished-field"><span>Organisation <b>*</b></span><input required placeholder="Organisation name"/></label>
   <label className="polished-field"><span>Role / title <b>*</b></span><input required placeholder="e.g. Data Analyst Intern"/></label>
   <label className="polished-field"><span>Location</span><input placeholder="Remote / city"/></label>
   <label className="polished-field"><span>Deadline</span><input type="date"/></label>
   <label className="polished-field"><span>Stipend / salary</span><input placeholder="Optional"/></label>
   <label className="polished-field full"><span>Eligibility <b>*</b></span><textarea rows={3} required placeholder="Who can apply? Include year, programme or skills if relevant."/></label>
   <label className="polished-field full"><span>Description <b>*</b></span><textarea rows={4} required placeholder="Summarise the role, responsibilities and important details."/></label>
   <label className="polished-field full"><span>Official application link <b>*</b></span><input type="url" required placeholder="https://..."/></label>
  </div><div className="form-actions"><div className="form-note"><strong>✓</strong><span>Only verified opportunities should be published.</span></div><button className="btn primary">Submit for moderation →</button></div></form>
 </div><aside className="form-aside"><div className="form-aside-card"><div className="form-aside-number">PUBLISHING CHECK</div><h3>Keep it verifiable.</h3><p>Use an official organisation or application link. Moderators will review the submission before publication.</p><div className="form-aside-list"><div><i>1</i> Add accurate details</div><div><i>2</i> Include official link</div><div><i>3</i> Wait for moderation</div></div></div></aside></div></section>}
 </PageShell>
}