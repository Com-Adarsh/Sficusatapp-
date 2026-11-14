"use client";
import PageShell from "../../../components/PageShell";
import {useState} from "react";

export default function Status(){
 const [id,setId]=useState("");
 const [shown,setShown]=useState(false);
 return <PageShell>
  <section className="hero compact"><div className="shell"><div className="eyebrow">Aashraya</div><h1>Track a blood <em>request.</em></h1><p>Enter a request ID to view the coordination stage. Demo mode shows an example status only.</p></div></section>
  <section className="section"><div className="shell"><div className="authcard wide">
   <form className="formgrid" onSubmit={e=>{e.preventDefault();setShown(true)}}>
    <label className="full">Request ID<input value={id} onChange={e=>setId(e.target.value)} required placeholder="e.g. AR-DEMO-001"/></label>
    <div className="full"><button className="btn primary">Check status</button></div>
   </form>
   {shown&&<div className="card" style={{marginTop:20}}><span className="chip">Demo status</span><h2 style={{marginTop:12}}>Coordinator review</h2><p>Request <strong>{id}</strong> has been received in the demonstration workflow. In the live system, the timeline will show verification, donor matching, consent and fulfilment.</p><div className="chips"><span className="status">Received</span><span className="status">Verification pending</span><span className="status">Donor match pending</span></div></div>}
  </div></div></section>
 </PageShell>
}