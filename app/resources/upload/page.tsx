"use client";

import PageShell from "../../components/PageShell";
import { useState } from "react";

export default function Upload() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <img
              src="/logos/abhimanyu-learning-space.png"
              alt="Abhimanyu Learning Space logo"
              style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 16, background: "white", padding: 5 }}
            />
            <div>
              <div className="eyebrow">Abhimanyu Learning Space · Upload</div>
              <div style={{ fontSize: 13, opacity: 0.72, marginTop: 6 }}>Course-wise and year-wise resource submission</div>
            </div>
          </div>
          <h1>Share a useful <em>resource.</em></h1>
          <p>Organise resources by department, programme, course and year so students can find them quickly. Uploads require moderation.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="authcard wide">
            {submitted ? (
              <>
                <h2>Resource submitted</h2>
                <p>Demo upload queued for moderation. No file has been stored while the backend is paused.</p>
                <a className="btn primary" href="/resources">Back to resources</a>
              </>
            ) : (
              <form className="formgrid" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <label>
                  Department
                  <select>
                    <option>Statistics</option>
                    <option>Mathematics</option>
                    <option>Computer Applications</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Programme
                  <input required placeholder="Integrated M.Sc. …" />
                </label>
                <label>
                  Academic year / batch
                  <input placeholder="2026–27" />
                </label>
                <label>
                  Semester
                  <select>
                    {Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                  </select>
                </label>
                <label>
                  Course code
                  <input placeholder="e.g. STA…" />
                </label>
                <label>
                  Course name
                  <input required />
                </label>
                <label>
                  Resource type
                  <select>
                    <option>Notes</option>
                    <option>Question Paper</option>
                    <option>Syllabus</option>
                    <option>Academic Update</option>
                  </select>
                </label>
                <label>
                  Exam / resource year
                  <input placeholder="2026" />
                </label>
                <label className="full">
                  Resource title
                  <input required />
                </label>
                <label className="full">
                  File
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" />
                </label>
                <label className="full">
                  <input type="checkbox" required /> I have the right to share this material and it does not contain unauthorised copyrighted content.
                </label>
                <div className="full">
                  <button className="btn primary" type="submit">Submit for moderation</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}