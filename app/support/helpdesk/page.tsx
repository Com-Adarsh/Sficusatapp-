"use client";
import {FormEvent,useEffect,useState} from "react";
import {createBrowserClient} from "@/lib/supabase/client";

type Ticket={id:string;ticket_code:string;subject:string;status:string;priority:string;created_at:string};

export default function Helpdesk(){
  const [tickets,setTickets]=useState<Ticket[]>([]);
  const [msg,setMsg]=useState("");
  const [busy,setBusy]=useState(false);
  const load=async()=>{const s=createBrowserClient();const {data:{user}}=await s.auth.getUser();if(!user){location.href="/sign-in";return;}const {data}=await s.from("helpdesk_tickets").select("id,ticket_code,subject,status,priority,created_at").order("created_at",{ascending:false});setTickets(data||[]);};
  useEffect(()=>{load()},[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMsg("");
    const f=new FormData(e.currentTarget);const s=createBrowserClient();const {data:{user}}=await s.auth.getUser();
    if(!user){location.href="/sign-in";return;}
    const code="HELP-"+Date.now().toString(36).toUpperCase();
    const {error}=await s.from("helpdesk_tickets").insert({ticket_code:code,requester_id:user.id,category:f.get("category"),subject:f.get("subject"),description:f.get("description"),priority:f.get("priority")});
    setBusy(false);setMsg(error?error.message:"Ticket created. Your ticket ID is "+code);if(!error){e.currentTarget.reset();await load();}
  }
  return <main><section className="hero"><div className="shell"><div className="eyebrow"><i className="dot"/> Helpdesk</div><h1>Get the help you <em>need.</em></h1><p>Ask a question or report a support issue. Use grievances for formal concerns and the helpdesk for assistance.</p></div></section><section className="section"><div className="shell"><div className="grid2"><form className="form card" onSubmit={submit}><h2>Create a ticket</h2><label>Category<select name="category" defaultValue="general"><option value="general">General</option><option value="academic">Academic resources</option><option value="account">Account</option><option value="initiative">Initiative support</option><option value="accessibility">Accessibility</option><option value="technical">Technical</option></select></label><label>Priority<select name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>Subject<input name="subject" required maxLength={160}/></label><label>Details<textarea name="description" required rows={6} maxLength={5000}/></label><button disabled={busy}>{busy?"Creating…":"Create ticket"}</button>{msg&&<div className="notice">{msg}</div>}</form><div><h2>Your tickets</h2>{tickets.length?tickets.map(t=><a className="card" style={{display:"block",marginBottom:12}} href={"/support/helpdesk/"+t.id} key={t.id}><div className="chips"><span className="chip">{t.ticket_code}</span><span className="chip">{t.status}</span><span className="chip">{t.priority}</span></div><h3>{t.subject}</h3><p>{new Date(t.created_at).toLocaleString()}</p></a>):<div className="notice">You have no helpdesk tickets yet.</div>}</div></div></div></section></main>;
}