"use client";
import PageShell from "../../components/PageShell";
import {useMemo,useState} from "react";
const rows=[
 ["Probability & Random Variables","Statistics","Integrated M.Sc. Statistics","2025–26","Sem 2","STA201","Notes"],
 ["Statistical Inference","Statistics","Integrated M.Sc. Statistics","2025–26","Sem 4","STA401","Question Paper"],
 ["Mathematical Statistics","Mathematics","Integrated M.Sc. Mathematics","2025–26","Sem 3","MAT301","Notes"],
 ["Academic Calendar","University","All programmes","2026–27","All","—","Academic Update"],
 ["Statistical Computing","Statistics","Integrated M.Sc. Statistics","2025–26","Sem 4","STA405","Notes"]
];
export default function Browse(){
 const[q,setQ]=useState(""),[dept,setDept]=useState("All departments"),[year,setYear]=useState("All years"),[sem,setSem]=useState("All semesters"),[type,setType]=useState("All types");
 const filtered=useMemo(()=>rows.filter(r=>(dept==="All departments"||r[1]===dept)&&(year==="All years"||r[3]===year)&&(sem==="All semesters"||r[4]===sem)&&(type==="All types"||r[6]===type)&&r.join(" ").toLowerCase().includes(q.toLowerCase())),[q,dept,year,sem,type]);
 return <PageShell><section className="hero compact"><div className="shell"><div className="eyebrow">Abhimanyu Learning Space</div><h1>Browse <em>course resources.</em></h1><p>Organised department → programme → year → semester → course, so students can find the right material quickly.</p><div className="actions"><a className="btn primary" href="/resources/upload">Upload a resource</a></div></div></section><section className="section"><div className="shell"><div className="formgrid">
 <select className="field" value={dept} onChange={e=>setDept(e.target.value)}><option>All departments</option><option>Statistics</option><option>Mathematics</option><option>Computer Applications</option><option>Physics</option><option>Chemistry</option><option>Electronics</option><option>Engineering</option></select>
 <select className="field" value={year} onChange={e=>setYear(e.target.value)}><option>All years</option><option>2026–27</option><option>2025–26</option></select>
 <select className="field" value={sem} onChange={e=>setSem(e.target.value)}><option>All semesters</option>{["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"].map(x=><option key={x}>{x}</option>)}</select>
 <select className="field" value={type} onChange={e=>setType(e.target.value)}><option>All types</option><option>Notes</option><option>Question Paper</option><option>Syllabus</option><option>Academic Update</option></select>
 </div><div className="searchbox" style={{marginTop:12}}><input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search course code, course name or resource title…"/></div>
 <div className="chips"><span className="chip">{filtered.length} catalogue records</span><span className="chip">Course-wise</span><span className="chip">Year-wise</span></div>
 <div className="table-wrap" style={{marginTop:18}}><table className="table"><thead><tr><th>Course / resource</th><th>Department</th><th>Programme</th><th>Year</th><th>Semester</th><th>Course code</th><th>Type</th><th></th></tr></thead><tbody>{filtered.map(r=><tr key={r.join("|")}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td><span className="status">{r[6]}</span></td><td><button className="btn" type="button">Preview</button></td></tr>)}</tbody></table></div>
 </div></section></PageShell>
}