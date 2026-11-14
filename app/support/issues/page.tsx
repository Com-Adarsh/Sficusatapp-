import PageShell from "../../components/PageShell";

const demoIssues = [
  ["Academic calendar clarification", "Academic", "Acknowledged", "A moderated demo issue. Live records will appear after backend connection."],
  ["Hostel maintenance request", "Hostel", "In progress", "A moderated demo issue. Personal information is never displayed publicly."]
];

export default function Issues() {
  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow"><i className="dot"/> Student Issues</div>
          <h1>Issues students are <em>raising.</em></h1>
          <p>Browse moderated student issues and raise a new one. This frontend currently uses demo records while the backend is paused.</p>
          <a className="btn primary" href="/support/issues/new">+ Raise an issue</a>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="grid2">
            {demoIssues.map(([title, category, status, description]) => (
              <article className="card" key={title}>
                <div className="chips"><span className="chip">{category}</span><span className="chip">{status}</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="notice" style={{marginTop:18}}>
            <div className="icon" style={{margin:0}}>i</div>
            <div><strong>Privacy first</strong><p>Public issue listings should be moderated and anonymised. Serious matters should also be reported through the relevant official university or statutory channel.</p></div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
