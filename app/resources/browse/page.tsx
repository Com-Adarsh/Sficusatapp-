"use client";

import PageShell from "../../components/PageShell";
import { useMemo, useState } from "react";
import {
  CUSAT_DEPARTMENTS,
  CUSAT_PROGRAMMES,
  programmesForDepartment,
} from "@/lib/cusat-catalog";

const rows = [
  ["Probability & Random Variables", "Department of Statistics", "Five- Year Integrated M.Sc. in Statistics", "2025–26", "Sem 2", "STA201", "Notes"],
  ["Statistical Inference", "Department of Statistics", "MSc Statistics", "2025–26", "Sem 4", "STA401", "Question Paper"],
  ["Mathematical Statistics", "Department of Mathematics", "Five- Year Integrated M.Sc. in Mathematics", "2025–26", "Sem 3", "MAT301", "Notes"],
  ["Academic Calendar", "All departments", "All programmes", "2026–27", "All", "—", "Academic Update"],
  ["Statistical Computing", "Department of Statistics", "MSc Statistics", "2025–26", "Sem 4", "STA405", "Notes"],
];

export default function Browse() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All departments");
  const [programme, setProgramme] = useState("All programmes");
  const [year, setYear] = useState("All years");
  const [sem, setSem] = useState("All semesters");
  const [type, setType] = useState("All types");

  const programmeOptions = useMemo(
    () => dept === "All departments"
      ? CUSAT_PROGRAMMES
      : programmesForDepartment(dept),
    [dept],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (dept === "All departments" || r[1] === dept) &&
          (programme === "All programmes" || r[2] === programme) &&
          (year === "All years" || r[3] === year) &&
          (sem === "All semesters" || r[4] === sem) &&
          (type === "All types" || r[6] === type) &&
          r.join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [q, dept, programme, year, sem, type],
  );

  function changeDepartment(value: string) {
    setDept(value);
    setProgramme("All programmes");
  }

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Abhimanyu Learning Space</div>
          <h1>Browse <em>course resources.</em></h1>
          <p>Organised department → programme → year → semester → course, so students can find the right material quickly.</p>
          <div className="actions"><a className="btn primary" href="/resources/upload">Upload a resource</a></div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="formgrid">
            <select className="field" value={dept} onChange={(e) => changeDepartment(e.target.value)}>
              <option>All departments</option>
              {CUSAT_DEPARTMENTS.map((department) => (
                <option key={department.id} value={department.name}>{department.name}</option>
              ))}
            </select>

            <select className="field" value={programme} onChange={(e) => setProgramme(e.target.value)}>
              <option>All programmes</option>
              {programmeOptions.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>

            <select className="field" value={year} onChange={(e) => setYear(e.target.value)}>
              <option>All years</option><option>2026–27</option><option>2025–26</option>
            </select>

            <select className="field" value={sem} onChange={(e) => setSem(e.target.value)}>
              <option>All semesters</option>
              {["Sem 1","Sem 2","Sem 3","Sem 4","Sem 5","Sem 6","Sem 7","Sem 8"].map((x) => <option key={x}>{x}</option>)}
            </select>

            <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
              <option>All types</option><option>Notes</option><option>Question Paper</option><option>Syllabus</option><option>Academic Update</option>
            </select>
          </div>

          <div className="searchbox" style={{ marginTop: 12 }}>
            <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search course code, course name or resource title…" />
          </div>

          <div className="chips">
            <span className="chip">{filtered.length} catalogue records</span>
            <span className="chip">Department-wise</span>
            <span className="chip">Programme-wise</span>
            <span className="chip">Semester-wise</span>
          </div>

          <div className="table-wrap" style={{ marginTop: 18 }}>
            <table className="table">
              <thead><tr><th>Course / resource</th><th>Department</th><th>Programme</th><th>Year</th><th>Semester</th><th>Course code</th><th>Type</th><th /></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.join("|")}>
                    <td><strong>{r[0]}</strong></td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>{r[5]}</td>
                    <td><span className="status">{r[6]}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button className="btn" type="button">Preview</button>
                        <a className="btn primary" href={"/ai?subject=" + encodeURIComponent(r[0])}>Ask AI</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="notice" style={{ marginTop: 18 }}>
            <div className="icon" style={{ margin: 0 }}>i</div>
            <div>
              <strong>Programme catalogue synced for CAT 2026</strong>
              <p>The filters now use the official CUSAT 2026 department and programme catalogue. Resource records themselves remain subject to moderation.</p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
