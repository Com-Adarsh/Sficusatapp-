"use client";
import PageShell from "../components/PageShell";
import AcademicSelectors from "../components/AcademicSelectors";
import { useState } from "react";

const demo = [
  ["Science Scholarship", "Merit / science students", "Demo listing"],
  ["Need-based Student Scholarship", "Financial assistance", "Demo listing"],
  ["Research Support Scholarship", "Higher education / research", "Demo listing"],
];

export default function Scholarships() {
  const [s, setS] = useState(false);
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Opportunities · Scholarships</div>
          <h1>Find and share <em>scholarships.</em></h1>
          <p>Students can discover scholarships, contribute verified opportunities and ask questions through a moderated scholarship discussion space.</p>
          <div className="actions"><a className="btn primary" href="#add">Add scholarship</a></div>
        </div>
      </section>

      <section className="section">
        <div className="shell grid3">
          {demo.map((x) => (
            <article className="card" key={x[0]}>
              <span className="chip">{x[2]}</span>
              <h3 style={{ marginTop: 12 }}>{x[0]}</h3>
              <p>{x[1]}</p>
              <div className="actions"><a className="btn" href="/scholarships/chat">Ask a doubt</a></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="add">
        <div className="shell">
          <div className="authcard wide">
            {s ? (
              <>
                <h2>Scholarship submitted</h2>
                <p>Submitted for verification in demo mode. Students should not rely on an unverified listing for an application deadline or eligibility decision.</p>
                <button className="btn primary" onClick={() => setS(false)}>Add another</button>
              </>
            ) : (
              <form className="formgrid" onSubmit={(e) => { e.preventDefault(); setS(true); }}>
                <label>Scholarship name<input required /></label>
                <label>Provider / organisation<input required /></label>

                <div className="full">
                  <AcademicSelectors
                    departmentId={departmentId}
                    programmeId={programmeId}
                    onDepartmentChange={(value) => { setDepartmentId(value); setProgrammeId(""); }}
                    onProgrammeChange={setProgrammeId}
                    departmentRequired={false}
                    programmeRequired={false}
                  />
                  <small style={{ display: "block", marginTop: 8, opacity: 0.65 }}>Optional academic targeting for CUSAT students.</small>
                </div>

                <label>Eligibility<input required /></label>
                <label>Deadline<input type="date" /></label>
                <label className="full">Amount / benefits<input /></label>
                <label className="full">Details<textarea rows={4} required /></label>
                <label className="full">Official source / application link<input type="url" required placeholder="https://…" /></label>
                <div className="full"><button className="btn primary">Submit scholarship for verification</button></div>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
