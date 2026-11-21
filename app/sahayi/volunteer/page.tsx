"use client";
import PageShell from "../../components/PageShell";
import AcademicSelectors from "../../components/AcademicSelectors";
import { useState } from "react";

export default function Volunteer() {
  const [s, setS] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");

  return (
    <PageShell>
      <section className="hero compact form-hero">
        <div className="shell">
          <div className="eyebrow">Sahayi · Volunteer</div>
          <h1>Become a <em>scribe.</em></h1>
          <p>Register your academic strengths, languages and availability for coordinator review. Demo mode does not store your details.</p>
          <div className="form-hero-meta"><span>✦ Flexible availability</span><span>✦ Coordinator review</span><span>✦ Student support</span></div>
        </div>
      </section>

      {s ? (
        <div className="shell">
          <div className="form-success">
            <div className="form-success-icon">✓</div>
            <h2>Volunteer application <em>recorded.</em></h2>
            <p>Demo application ID: SV-DEMO-001. Coordinator vetting and assignment matching will be enabled with the backend.</p>
            <div className="actions">
              <a className="btn primary" href="/sahayi/assignments">View assignments</a>
              <button className="btn" onClick={() => setS(false)}>Apply again</button>
            </div>
          </div>
        </div>
      ) : (
        <section className="form-section">
          <div className="shell form-layout">
            <div className="form-card">
              <div className="form-card-head">
                <div className="form-card-icon">✦</div>
                <div>
                  <small>Step 1 · Volunteer profile</small>
                  <h2>Tell us how you can help</h2>
                  <p>Share your academic strengths, languages and available time.</p>
                </div>
              </div>
              <form className="polished-form" onSubmit={(e) => { e.preventDefault(); setS(true); }}>
                <div className="polished-grid">
                  <AcademicSelectors
                    departmentId={departmentId}
                    programmeId={programmeId}
                    onDepartmentChange={(value) => {
                      setDepartmentId(value);
                      setProgrammeId("");
                    }}
                    onProgrammeChange={setProgrammeId}
                  />
                  <label className="polished-field">
                    <span>Semester</span>
                    <input type="number" min="1" max="20" placeholder="e.g. 4" />
                  </label>
                  <label className="polished-field">
                    <span>Subjects you can support</span>
                    <input placeholder="Subjects" />
                  </label>
                  <label className="polished-field">
                    <span>Languages</span>
                    <input placeholder="English, Malayalam…" />
                  </label>
                  <label className="polished-field full">
                    <span>Availability <b>*</b></span>
                    <textarea rows={4} required placeholder="Days / times you are usually available" />
                  </label>
                </div>
                <div className="form-actions">
                  <div className="form-note"><strong>✓</strong><span>Your details are reviewed by the Sahayi coordinator before assignment.</span></div>
                  <button className="btn primary">Apply as volunteer →</button>
                </div>
              </form>
            </div>
            <aside className="form-aside">
              <div className="form-aside-card">
                <div className="form-aside-number">VOLUNTEER JOURNEY</div>
                <h3>Use your skills to support a peer.</h3>
                <p>Tell us where you can help. Coordinators can match volunteers with suitable requests.</p>
                <div className="form-aside-list"><div><i>1</i> Share subjects & languages</div><div><i>2</i> Add availability</div><div><i>3</i> Review assignments</div></div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </PageShell>
  );
}
