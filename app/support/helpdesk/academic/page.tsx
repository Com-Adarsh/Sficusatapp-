"use client";
import PageShell from "../../../components/PageShell";
import { useState } from "react";

const depts=["Department of Statistics","Department of Mathematics","Department of Computer Applications","Department of Physics","Department of Chemistry","Department of Electronics","Department of Engineering","Department of Management Studies","Department of Marine Sciences","Department of Polymer Science & Rubber Technology","Department of Atmospheric Sciences","Department of Biotechnology"];

export default function Academic(){
 const[q,setQ]=useState(""),[showForm,setShowForm]=useState(false),[sent,setSent]=useState(false);
 const rows=depts.filter(d=>d.toLowerCase().includes(q.toLowerCase()));
 return <PageShell>
  <section className="hero compact form-hero"><div className="shell">
   <div className="eyebrow">Academic Helpdesk</div><h1>Find your <em>department.</em></h1>
   <p>Find department-level academic information, coordinator contacts, student guidance and computer-based examinations in one place.</p>
   <div className="actions"><a className="btn primary" href="/support/helpdesk/academic/cbt">Open CBT Examination Platform →</a><button className="btn" type="button" onClick={()=>setShowForm(v=>!v)}>{showForm?"Close form":"Coordinator? Add your department →"}</button></div>
  </div></section>

  <section className="section"><div className="shell">
   <div className="academic-cbt-card">
    <div><span className="cbt-kicker">CBT · COMPUTER-BASED TESTING</span><h2>Conduct exams like a real <em>computer-based test.</em></h2><p>Department coordinators can create scheduled examinations, upload questions and answer keys, invite students worldwide, monitor attempts and download final results.</p>
    <div className="cbt-pills"><span>Timed exams</span><span>Question palette</span><span>Autosave</span><span>Answer-key scoring</span><span>Result export</span></div></div>
    <div className="cbt-card-actions"><a className="btn primary" href="/support/helpdesk/academic/cbt/coordinator">Coordinator dashboard</a><a className="btn" href="/support/helpdesk/academic/cbt/tests">Find an examination</a></div>
   </div>
  </div></section>

  <section className="section"><div className="shell">
   <div className="searchbox"><input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search department…"/><span className="chip">{rows.length} departments</span></div>
   <div className="grid3" style={{marginTop:18}}>{rows.map(d=><article className="card" key={d}><div className="icon">▦</div><h3>{d}</h3><p>Department programmes, coordinator contacts, office details and student guidance can be published here after verification.</p><button className="btn" type="button">View department</button></article>)}</div>
   <div className="notice" style={{marginTop:18}}><div className="icon" style={{margin:0}}>✓</div><div><strong>Verified academic information</strong><p>Coordinator-submitted information should be checked against official CUSAT sources before publication.</p></div></div>
  </div></section>

  {showForm&&<section className="form-section" id="add-department"><div className="shell"><div className="form-card">
   <div className="form-card-head"><div className="form-card-icon">▦</div><div><small>Department coordinator</small><h2>Add your department</h2><p>Department coordinators can submit useful academic information for students. Every submission is reviewed before it appears in the public directory.</p></div></div>
   {sent?<div className="form-success" style={{margin:"24px auto 0"}}><div className="form-success-icon">✓</div><h2>Department sent for <em>verification.</em></h2><p>Thank you. A moderator can verify the coordinator details and official department information before publication.</p><button className="btn primary" type="button" onClick={()=>{setSent(false);setShowForm(false)}}>Back to directory</button></div>:
   <form className="polished-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><div className="polished-grid">
    <label className="polished-field full"><span>Department name <b>*</b></span><input required placeholder="e.g. Department of Statistics"/></label>
    <label className="polished-field"><span>Coordinator name <b>*</b></span><input required placeholder="Full name"/></label><label className="polished-field"><span>Designation</span><input placeholder="e.g. Department Coordinator"/></label>
    <label className="polished-field"><span>Official email <b>*</b></span><input required type="email" placeholder="name@cusat.ac.in"/></label><label className="polished-field"><span>Office / phone</span><input placeholder="Office number or official contact"/></label>
    <label className="polished-field"><span>Office / block</span><input placeholder="Building, room or office"/></label><label className="polished-field full"><span>Programmes / courses</span><textarea rows={3} placeholder="Programmes, semesters or major courses students should know about…"/></label>
    <label className="polished-field full"><span>Student guidance</span><textarea rows={4} placeholder="Office hours, common academic contacts, procedures, links or other useful guidance…"/></label><label className="polished-field full"><span>Official department webpage</span><input type="url" placeholder="https://…"/></label>
   </div><div className="form-actions"><div className="form-note"><strong>✓</strong><span>Only verified department information should be published. Use an official CUSAT email wherever possible.</span></div><button className="btn primary">Submit department →</button></div></form>}
  </div></div></section>}
 </PageShell>
}