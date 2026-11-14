"use client";
import PageShell from "../../components/PageShell";
import {useState} from "react";

export default function Request(){
 const[sent,setSent]=useState(false);
 return <PageShell>
  <section className="hero compact form-hero"><div className="shell">
   <div className="eyebrow">Aashraya · Blood Donation Cell</div>
   <h1>Request <em>blood support.</em></h1>
   <p>Tell us what is needed. Your request is designed to be reviewed by an Aashraya coordinator before any donor contact is shared.</p>
   <div className="form-hero-meta"><span>● Coordinator reviewed</span><span>● Privacy first</span><span>● Quick response</span></div>
  </div></section>
  {sent?<div className="shell"><div className="form-success"><div className="form-success-icon">✓</div><h2>Request sent for <em>review.</em></h2><p>Your request has been captured in demo mode. A real request will receive a tracking ID after the database is connected.</p><div className="actions"><a className="btn primary" href="/aashraya">Back to Aashraya</a><button className="btn" onClick={()=>setSent(false)}>Submit another</button></div></div></div>:
  <section className="section form-section"><div className="shell form-layout">
   <div className="form-card"><div className="form-card-head"><div className="form-card-icon">🩸</div><div><small>Step 1 · Request details</small><h2>Tell us what you need</h2><p>Use the details below so the coordinator can assess urgency and coordinate support.</p></div></div>
    <form className="polished-form" onSubmit={e=>{e.preventDefault();setSent(true)}}>
     <div className="polished-grid">
      <label className="polished-field"><span>Blood group <b>*</b></span><select required><option value="">Select blood group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></label>
      <label className="polished-field"><span>Units needed <b>*</b></span><input type="number" min="1" defaultValue="1" required/></label>
      <label className="polished-field"><span>Hospital <b>*</b></span><input required placeholder="Hospital name"/></label>
      <label className="polished-field"><span>District <b>*</b></span><input required placeholder="District"/></label>
      <label className="polished-field"><span>Urgency</span><select><option>Normal</option><option>Urgent</option><option>Critical</option></select></label>
      <label className="polished-field"><span>Needed by</span><input type="datetime-local"/></label>
      <label className="polished-field full"><span>Additional information</span><textarea rows={4} placeholder="Anything the coordinator should know"/></label>
     </div>
     <div className="form-actions"><div className="form-note"><strong>✓</strong><span>Your information is shared only as needed for coordination.</span></div><button className="btn primary">Submit blood request →</button></div>
    </form>
   </div>
   <aside className="form-aside"><div className="form-aside-card"><div className="form-aside-number">HOW IT WORKS</div><h3>Support reaches the right people.</h3><p>Your request enters coordinator review before donor contact is shared.</p><div className="form-aside-list"><div><i>1</i> Submit the request</div><div><i>2</i> Coordinator verifies details</div><div><i>3</i> Donor support is coordinated</div></div></div><div className="form-aside-card"><h3>Need urgent help?</h3><p>For critical cases, contact the Aashraya coordinator directly as well.</p></div></aside>
  </div></section>}
 </PageShell>
}