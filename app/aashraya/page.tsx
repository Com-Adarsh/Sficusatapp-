import PageShell from "../components/PageShell";

const actions=[
 ["Request Blood","Submit group, units, hospital, district, urgency and needed-by details privately.","/aashraya/request","♥"],
 ["Track Request","Check a request's coordination stage with its private request ID.","/aashraya/request/status","↗"],
 ["Donor Network","Register availability and contact preferences. Personal contact details stay private.","/aashraya/donor","+"],
 ["Donation Camps","Discover upcoming campus donation drives and registration information.","/aashraya/camps","▣"]
];

export default function Aashraya(){return <PageShell>
 <section className="hero compact"><div className="shell"><div className="eyebrow"><i className="dot"/> Aashraya · SFI CUSAT Blood Donation Cell</div><h1>Blood support, <em>when students need it.</em></h1><p>A privacy-conscious volunteer network connecting eligible donors with students who need blood through coordinator-led matching.</p><div className="actions"><a className="btn primary" href="/aashraya/request">Request Blood</a><a className="btn" href="/aashraya/donor">Become a Donor</a></div></div></section>
 <section className="section"><div className="shell grid4">{actions.map(([t,d,h,i])=><a className="card initiative a" href={h} key={t}><div className="icon">{i}</div><h3>{t}</h3><p>{d}</p><div className="chips"><span className="chip">Open →</span></div></a>)}</div></section>
 <section className="section"><div className="shell"><div className="notice"><div className="icon" style={{margin:0}}>!</div><div><strong>Important</strong><p>Aashraya is a volunteer network, not a medical service or blood bank. For emergencies, contact 112 or the relevant hospital blood bank. Medical eligibility and transfusion decisions remain with qualified professionals.</p></div></div></div></section>
 <section className="section"><div className="shell"><div className="card"><span className="chip">Coordinator workspace</span><h3 style={{marginTop:12}}>Review requests and coordinate matches</h3><p>Authorised coordinators will use a separate workspace for verification, donor consent and fulfilment tracking.</p><a className="btn" href="/aashraya/coordinator">Open demo workspace →</a></div></div></section>
</PageShell>}