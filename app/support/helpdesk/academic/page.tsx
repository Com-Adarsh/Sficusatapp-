"use client";

import PageShell from "../../../components/PageShell";
import AcademicSelectors from "../../../components/AcademicSelectors";
import { useState } from "react";
import { CUSAT_DEPARTMENTS, CUSAT_PROGRAMMES } from "@/lib/cusat-catalog";

export default function Academic() {
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");

  const rows = CUSAT_DEPARTMENTS.filter((department) =>
    department.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PageShell>
      <section className="hero compact form-hero">
        <div className="shell">
          <div className="eyebrow">Academic Helpdesk</div>
          <h1>Find your <em>department.</em></h1>
          <p>
            Find department-level academic information, coordinator contacts,
            programme guidance and student support in one place.
          </p>
          <div className="actions">
            <a className="btn primary" href="/support/helpdesk/academic/cbt">
              Open CBT Examination Platform →
            </a>
            <button className="btn" type="button" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Close form" : "Coordinator? Add your department →"}
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="academic-cbt-card">
            <div>
              <span className="cbt-kicker">CBT · COMPUTER-BASED TESTING</span>
              <h2>Conduct exams like a real <em>computer-based test.</em></h2>
              <p>
                Department coordinators can create scheduled examinations, upload
                questions and answer keys, invite students worldwide, monitor
                attempts and download final results.
              </p>
              <div className="cbt-pills">
                <span>Timed exams</span><span>Question palette</span><span>Autosave</span>
                <span>Answer-key scoring</span><span>Result export</span>
              </div>
            </div>
            <div className="cbt-card-actions">
              <a className="btn primary" href="/support/helpdesk/academic/cbt/coordinator">
                Coordinator dashboard
              </a>
              <a className="btn" href="/support/helpdesk/academic/cbt/tests">
                Find an examination
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="searchbox">
            <input
              className="field"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CUSAT department…"
            />
            <span className="chip">{rows.length} departments</span>
          </div>

          <div className="grid3" style={{ marginTop: 18 }}>
            {rows.map((department) => {
              const programmeCount = CUSAT_PROGRAMMES.filter(
                (programme) => programme.departmentId === department.id,
              ).length;

              return (
                <article className="card" key={department.id}>
                  <div className="icon">▦</div>
                  <h3>{department.name}</h3>
                  <p>
                    {programmeCount
                      ? `${programmeCount} CAT 2026 programme${programmeCount === 1 ? "" : "s"} in the academic catalogue.`
                      : "Department information can be published here after coordinator verification."}
                  </p>
                  <button className="btn" type="button" onClick={() => {
                    setDepartmentId(department.id);
                    setProgrammeId("");
                    setShowForm(true);
                    setTimeout(() => document.getElementById("add-department")?.scrollIntoView({ behavior: "smooth" }), 0);
                  }}>
                    Add / update department
                  </button>
                </article>
              );
            })}
          </div>

          <div className="notice" style={{ marginTop: 18 }}>
            <div className="icon" style={{ margin: 0 }}>✓</div>
            <div>
              <strong>Official CAT 2026 academic catalogue</strong>
              <p>
                The department and programme selectors use the CUSAT CAT 2026
                admissions catalogue. Coordinator-submitted contacts and guidance
                still require moderation before publication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="form-section" id="add-department">
          <div className="shell">
            <div className="form-card">
              <div className="form-card-head">
                <div className="form-card-icon">▦</div>
                <div>
                  <small>Department coordinator</small>
                  <h2>Add your department</h2>
                  <p>
                    Department coordinators can submit useful academic information
                    for students. Every submission is reviewed before publication.
                  </p>
                </div>
              </div>

              {sent ? (
                <div className="form-success" style={{ margin: "24px auto 0" }}>
                  <div className="form-success-icon">✓</div>
                  <h2>Department sent for <em>verification.</em></h2>
                  <p>
                    Thank you. A moderator can verify the coordinator details and
                    official department information before publication.
                  </p>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => { setSent(false); setShowForm(false); }}
                  >
                    Back to directory
                  </button>
                </div>
              ) : (
                <form
                  className="polished-form"
                  onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                >
                  <div className="polished-grid">
                    <AcademicSelectors
                      departmentId={departmentId}
                      programmeId={programmeId}
                      onDepartmentChange={(value) => {
                        setDepartmentId(value);
                        setProgrammeId("");
                      }}
                      onProgrammeChange={setProgrammeId}
                      programmeRequired
                    />

                    <label className="polished-field">
                      <span>Coordinator name <b>*</b></span>
                      <input required placeholder="Full name" />
                    </label>
                    <label className="polished-field">
                      <span>Designation</span>
                      <input placeholder="e.g. Department Coordinator" />
                    </label>
                    <label className="polished-field">
                      <span>Official email <b>*</b></span>
                      <input required type="email" placeholder="name@cusat.ac.in" />
                    </label>
                    <label className="polished-field">
                      <span>Office / phone</span>
                      <input placeholder="Office number or official contact" />
                    </label>
                    <label className="polished-field">
                      <span>Office / block</span>
                      <input placeholder="Building, room or office" />
                    </label>
                    <label className="polished-field full">
                      <span>Additional programmes / courses</span>
                      <textarea
                        rows={3}
                        placeholder="Add programme variants or course-level information not captured by the catalogue…"
                      />
                    </label>
                    <label className="polished-field full">
                      <span>Student guidance</span>
                      <textarea
                        rows={4}
                        placeholder="Office hours, common academic contacts, procedures, links or other useful guidance…"
                      />
                    </label>
                    <label className="polished-field full">
                      <span>Official department webpage</span>
                      <input type="url" placeholder="https://…" />
                    </label>
                  </div>
                  <div className="form-actions">
                    <div className="form-note">
                      <strong>✓</strong>
                      <span>
                        Only verified department information should be published.
                        Use an official CUSAT email wherever possible.
                      </span>
                    </div>
                    <button className="btn primary">Submit department →</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
