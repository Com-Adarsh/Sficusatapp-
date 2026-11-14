import PageShell from "../../components/PageShell";

const demoInterventions = [
  ["Academic support follow-up", "Completed", "Demo outcome: the responsible student-support team followed up and recorded an outcome."],
  ["Student facility intervention", "Completed", "Demo outcome: the concern was documented and routed to the appropriate authority."]
];

export default function Interventions() {
  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow"><i className="dot"/> Interventions</div>
          <h1>From issue to <em>outcome.</em></h1>
          <p>Only moderated, publishable intervention records are shown publicly. Live records will appear after backend connection.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="grid2">
            {demoInterventions.map(([action, status, outcome]) => (
              <article className="card" key={action}>
                <span className="chip">{status}</span>
                <h3 style={{marginTop:12}}>{action}</h3>
                <p>{outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
