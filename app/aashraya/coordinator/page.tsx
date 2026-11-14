"use client";
import PageShell from "../../components/PageShell";
import {useState} from "react";

const requests=[
  ["AR-DEMO-001","A+","2 units","Urgent","Awaiting donor match"],
  ["AR-DEMO-002","O+","1 unit","Normal","Coordinator review"],
  ["AR-DEMO-003","B-","2 units","Critical","Donor responses pending"]
];
const donors=[
  ["Demo donor 01","O+","Available","Campus area"],
  ["Demo donor 02","A+","Available","Hostel area"],
  ["Demo donor 03","B-","Temporarily unavailable","Off campus"]
];

export default function Coordinator(){
 const [notice,setNotice]=useState("");
 return <PageShell>
  <section className="hero compact"><div className="shell">
   <div className="eyebrow">Aashraya · Coordinator workspace</div>
   <h1>Coordinate blood <em>support safely.</em></h1>
   <p>Review requests, assess donor availability and move matches through a coordinator-led workflow. Demo workspace — no real medical records are shown.</p>
  </div></section>
  <section className="section"><div className="shell">
   <div className="grid4">
    <div className="stat"><b>03</b><span>Demo requests</span></div>
    <div className="stat"><b>03</b><span>Demo donor profiles</span></div>
    <div className="stat"><b>02</b><span>Needs review</span></div>
    <div className="stat"><b>00</b><span>Real matches</span></div>
   </div>
  </div></section>
  <section className="section"><div className="shell">
   <div className="sectionhead"><div><h2>Blood requests</h2><p>Use the request ID for internal coordination; never expose private contact details publicly.</p></div></div>
   <div className="table-wrap"><table className="table"><thead><tr><th>Request</th><th>Group</th><th>Need</th><th>Urgency</th><th>Status</th><th></th></tr></thead>
   <tbody>{requests.map(r=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td><span className="status">{r[3]}</span></td><td>{r[4]}</td><td><button className="btn" onClick={()=>setNotice(`Demo: opened ${r[0]} for coordinator review.`)}>Review</button></td></tr>)}</tbody></table></div>
  </div></section>
  <section className="section"><div className="shell">
   <div className="sectionhead"><div><h2>Donor availability</h2><p>Personal phone numbers and email addresses are intentionally hidden from this demo.</p></div></div>
   <div className="grid3">{donors.map(d=><article className="card" key={d[0]}><span className="chip">{d[1]}</span><h3 style={{marginTop:12}}>{d[0]}</h3><p>{d[3]}</p><div className="chips"><span className="status">{d[2]}</span><button className="btn" onClick={()=>setNotice(`Demo: donor consent/contact flow would begin for ${d[0]}.`)}>Match</button></div></article>)}</div>
  </div></section>
  {notice&&<section className="section"><div className="shell"><div className="notice"><div className="icon" style={{margin:0}}>i</div><div><strong>Demo action</strong><p>{notice}</p></div></div></div></section>}
  <section className="section"><div className="shell"><div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Safety boundary</strong><p>Aashraya is a volunteer network, not a blood bank or medical service. Coordinator tools must not replace hospital blood-bank procedures or emergency care.</p></div></div></div></section>
 </PageShell>
}