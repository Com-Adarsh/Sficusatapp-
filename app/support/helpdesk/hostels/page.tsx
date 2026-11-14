"use client";
import PageShell from "../../../components/PageShell";
import {useState} from "react";
const demo=[["University Hostel — Boys","University Hostel","Boys","CUSAT campus",""],["University Hostel — Girls","University Hostel","Girls","CUSAT campus",""],["PG Hostel Directory — Boys","PG Hostel","Boys","Around CUSAT",""],["PG Hostel Directory — Girls","PG Hostel","Girls","Around CUSAT",""]];
export default function Hostels(){
 const[type,setType]=useState("All"),[gender,setGender]=useState("All"),[q,setQ]=useState(""),[sent,setSent]=useState(false);
 const rows=demo.filter(x=>(type==="All"||x[1]===type)&&(gender==="All"||x[2]===gender)&&x.join(" ").toLowerCase().includes(q.toLowerCase()));
 return <PageShell><section className="hero compact form-hero"><div className="shell"><div className="eyebrow">Hostel Helpdesk</div><h1>Find a place to <em>stay.</em></h1><p>University and PG hostels for boys and girls. Community listings require moderator verification.</p><div className="actions"><a className="btn primary" href="#add">Add a hostel</a><a className="btn" href="/support/helpdesk">Back</a></div></div></section>
 <section className="section"><div className="shell"><div className="searchbox"><select className="field" value={type} onChange={e=>setType(e.target.value)}><option>All</option><option>University Hostel</option><option>PG Hostel</option></select><select className="field" value={gender} onChange={e=>setGender(e.target.value)}><option>All</option><option>Boys</option><option>Girls</option></select><input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search hostel, locality or name…"/></div><div className="grid2" style={{marginTop:18}}>{rows.map(r=><article className="card" key={r[0]}><div className="chips"><span className="chip">{r[1]}</span><span className="status">{r[2]}</span></div><h3 style={{marginTop:12}}>{r[0]}</h3><p>{r[3]}</p><div className="actions"><button className="btn" type="button">View details</button><button className="btn" type="button" disabled={!r[4]}>{r[4]?"Open map":"Map pending verification"}</button></div></article>)}</div></div></section>
 <section className="form-section" id="add"><div className="shell"><div className="form-card"><div className="form-card-head"><div className="form-card-icon">⌂</div><div><small>Community contribution</small><h2>Add a hostel</h2><p>Add hostel type, boys/girls category, facilities, rent information, contact method and an exact map link.</p></div></div>
 {sent?<div className="form-success" style={{margin:"24px auto 0"}}><div className="form-success-icon">✓</div><h2>Hostel sent for <em>verification.</em></h2><p>Thanks. A moderator should verify the listing before publication.</p><button className="btn primary" onClick={()=>setSent(false)}>Add another hostel</button></div>:
 <form className="polished-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><div className="polished-grid">
  <label className="polished-field"><span>Hostel name <b>*</b></span><input required placeholder="Hostel name"/></label>
  <label className="polished-field"><span>Type</span><select><option>PG Hostel</option><option>University Hostel</option></select></label>
  <label className="polished-field"><span>For</span><select><option>Boys</option><option>Girls</option></select></label>
  <label className="polished-field"><span>Area / locality <b>*</b></span><input required placeholder="Area or locality"/></label>
  <label className="polished-field"><span>Rent range</span><input placeholder="Optional"/></label>
  <label className="polished-field"><span>Contact method</span><input placeholder="Phone / website / owner contact"/></label>
  <label className="polished-field full"><span>Facilities & details</span><textarea rows={5} placeholder="Food, Wi-Fi, curfew, distance, rooms, rules…"/></label>
  <label className="polished-field full"><span>Google Maps location</span><input type="url" placeholder="Paste Google Maps link"/></label>
 </div><div className="form-actions"><div className="form-note"><strong>✓</strong><span>Listings are verified before they appear in the directory.</span></div><button className="btn primary">Submit for verification →</button></div></form>}
 </div></div></section></PageShell>
}