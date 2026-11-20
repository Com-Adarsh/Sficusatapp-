"use client";

import PageShell from "../components/PageShell";
import { api } from "@/lib/convex-api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

export default function Profile() {
  const profile = useQuery(api.platform.myAcademicProfile);
  const departments = useQuery(api.platform.listDepartments, {});
  const saveProfile = useMutation(api.platform.saveAcademicProfile);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    rollNumber: "",
    departmentId: "",
    programme: "",
    semester: "",
    year: "",
    scheme: "",
    campus: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName,
      studentId: profile.studentId ?? "",
      rollNumber: profile.rollNumber ?? "",
      departmentId: profile.departmentId ?? "",
      programme: profile.programme ?? "",
      semester: profile.semester?.toString() ?? "",
      year: profile.year?.toString() ?? "",
      scheme: profile.scheme ?? "",
      campus: profile.campus ?? "",
    });
  }, [profile]);

  const set = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await saveProfile({
        studentId: form.studentId || undefined,
        rollNumber: form.rollNumber || undefined,
        departmentId: form.departmentId || undefined,
        programme: form.programme || undefined,
        semester: form.semester ? Number(form.semester) : undefined,
        year: form.year ? Number(form.year) : undefined,
        scheme: form.scheme || undefined,
        campus: form.campus || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Student Profile</div>
          <h1>Your <em>academic identity.</em></h1>
          <p>Set this once and the CUSAT platform can personalise resources, PYQs, scholarships, career opportunities and support.</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="authcard wide">
            <form className="formgrid" onSubmit={submit}>
              <label>Full name<input value={form.fullName} readOnly /></label>
              <label>Student ID<input value={form.studentId} onChange={(e) => set("studentId", e.target.value)} placeholder="CUSAT ID" /></label>
              <label>Roll number<input value={form.rollNumber} onChange={(e) => set("rollNumber", e.target.value)} placeholder="Roll number" /></label>
              <label>Department
                <select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
                  <option value="">Select department</option>
                  {(departments ?? []).map((d: { legacyId: string; name: string }) => <option key={d.legacyId} value={d.legacyId}>{d.name}</option>)}
                </select>
              </label>
              <label>Programme<input value={form.programme} onChange={(e) => set("programme", e.target.value)} placeholder="e.g. Integrated M.Sc. Statistics" /></label>
              <label>Scheme
                <select value={form.scheme} onChange={(e) => set("scheme", e.target.value)}>
                  <option value="">Select scheme</option>
                  <option value="2019">2019</option>
                  <option value="2024">2024</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>Semester
                <select value={form.semester} onChange={(e) => set("semester", e.target.value)}>
                  <option value="">Select semester</option>
                  {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
              </label>
              <label>Year of study
                <select value={form.year} onChange={(e) => set("year", e.target.value)}>
                  <option value="">Select year</option>
                  {Array.from({ length: 6 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
              </label>
              <label>Campus<input value={form.campus} onChange={(e) => set("campus", e.target.value)} placeholder="CUSAT campus" /></label>
              <div className="full">
                <button className="btn primary" disabled={busy}>{busy ? "Saving…" : "Save academic profile"}</button>
              </div>
            </form>

            {saved && <div className="notice" style={{ marginTop: 16 }}><div className="icon" style={{ margin: 0 }}>✓</div><div><strong>Profile saved</strong><p>Your academic context is now available to the dashboard and future personalised modules.</p></div></div>}
            {error && <div className="notice" style={{ marginTop: 16 }}><div className="icon" style={{ margin: 0 }}>!</div><div><strong>Could not save</strong><p>{error}</p><p>Make sure you are signed in before saving.</p></div></div>}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
