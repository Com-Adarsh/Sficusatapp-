"use client";
import PageShell from "../../../components/PageShell";
import {useState} from "react";
const demo=[["Campus Tea Spot","Tea / snacks","Near campus"],["Student Café","Café","Around campus"],["Beauty Parlour Directory","Parlour","Around campus"],["Food & Hangout Spots","Food","Around campus"]];
export default function Spots(){
 const[cat,setCat]=useState("All"),[sent,setSent]=useState(false);const rows=demo.filter(x=>cat==="All"||x[1]===cat);
 return <PageShell><section className="hero compact form-hero"><div className="shell"><div className="eyebrow">Nearby Student Spots</div><h1>Go out, hang out, <em>connect.</em></h1><p>Discover tea spots, cafés, parlours, food places and other student-friendly places around campus.</p></div></section>
 <section className="section"><div className="shell"><select className="field" value={cat} onChange={e=>setCat(e.target.value)}><option>All</option><option>Tea / snacks</option><option>Café</option><option>Parlour</option><option>Food</option></select><div className="grid2" style={{marginTop:18}}>{rows.map(r=><article className="card" key={r[0]}><span className="chip">{r[1]}</span><h3 style={{marginTop:12}}>{r[0]}</h3><p>{r[2]}</p><div className="actions"><button className="btn">View map</button><button className="btn">Details</button></div></article>)}</div></div></section>
 <section className="form-section"><div className="shell"><div className="form-card"><div className="form-card-head"><div className="form-card-icon">☕</div><div><small>Community contribution</small><h2>Suggest a student-friendly spot</h2><p>Know a useful tea shop, café, parlour or food place? Add it for moderation.</p></div></div>
 {sent?<div className="form-success" style={{margin:"24px auto 0"}}><div className="form-success-icon">✓</div><h2>Spot <em>submitted.</em></h2><p>Submitted for moderation in demo mode.</p><button className="btn primary" onClick={()=>setSent(false)}>Suggest another</button></div>:
 <form className="polished-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><div className="polished-grid">
  <label className="polished-field"><span>Place name <b>*</b></span><input required placeholder="Place name"/></label>
  <label className="polished-field"><span>Category</span><select><option>Tea / snacks</option><option>Café</option><option>Parlour</option><option>Food</option><option>Other</option></select></label>
  <label className="polished-field"><span>Area / locality <b>*</b></span><input required placeholder="Area or locality"/></label>
  <label className="polished-field"><span>Map link</span><input type="url" placeholder="Google Maps link"/></label>
  <label className="polished-field full"><span>Why students may like it</span><textarea rows={4} placeholder="Price, atmosphere, opening hours, speciality…"/></label>
 </div><div className="form-actions"><div className="form-note"><strong>✓</strong><span>Useful local information helps students discover the campus area.</span></div><button className="btn primary">Suggest this spot →</button></div></form>}
 </div></div></section></PageShell>
}