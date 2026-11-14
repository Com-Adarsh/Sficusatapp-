"use client";
import PageShell from "../../components/PageShell";
import {useState} from "react";

const camps=[
 ["Campus Blood Donation Drive","Demo date · To be announced","Campus venue","Registration slots will appear here once a verified camp is published."],
 ["Community Blood Camp","Demo date · To be announced","Partner venue","Partner blood-bank details and eligibility guidance will be shown on the live listing."]
];

export default function Camps(){
 const [selected,setSelected]=useState("");
 return <PageShell>
  <section className="hero compact"><div className="shell"><div className="eyebrow">Aashraya</div><h1>Donation <em>camps.</em></h1><p>Discover verified campus drives, registration slots and partner blood-bank information without exposing private donor data.</p></div></section>
  <section className="section"><div className="shell grid2">{camps.map(c=><article className="card" key={c[0]}>
   <span className="chip">Demo listing</span><h3 style={{marginTop:12}}>{c[0]}</h3><p><strong>{c[1]}</strong> · {c[2]}</p><p>{c[3]}</p>
   <div className="chips"><button className="btn" onClick={()=>setSelected(c[0])}>View camp</button><span className="status">Slots: unavailable</span></div>
  </article>)}</div></section>
  {selected&&<section className="section"><div className="shell"><div className="notice"><div className="icon" style={{margin:0}}>i</div><div><strong>{selected}</strong><p>This is a frontend demonstration. Registration, consent, slot capacity and partner verification will be connected to the backend later.</p></div></div></div></section>}
  <section className="section"><div className="shell"><div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Before donating</strong><p>Follow the eligibility guidance of the participating blood bank or hospital. Aashraya does not provide medical eligibility decisions.</p></div></div></div></section>
 </PageShell>
}