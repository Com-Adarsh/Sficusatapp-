import PageShell from "../components/PageShell";

const categories = [
  "All",
  "Academic",
  "Student Support",
  "SFI CUSAT",
  "Opportunities",
  "Initiatives",
];

export default function Updates() {
  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Updates</div>
          <h1>
            What’s happening <em>now.</em>
          </h1>
          <p>
            Announcements, student initiatives, opportunities and important
            updates in one place. Organisational posts are always labelled SFI
            CUSAT.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="chips" style={{ marginBottom: 20 }}>
            {categories.map((category) => (
              <span className="chip" key={category}>
                {category}
              </span>
            ))}
          </div>

          <div className="empty">
            <strong>No live announcements yet</strong>
            <p>
              The frontend is ready. Verified announcements will appear here
              after the database and moderation workflow are connected.
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
