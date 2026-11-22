"use client";

import PageShell from "../../components/PageShell";
import AcademicSelectors from "../../components/AcademicSelectors";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Layers3,
  Send,
  ShieldCheck,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

export default function Upload() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [semester, setSemester] = useState("");

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`);
  };

  if (submitted) {
    return (
      <PageShell>
        <section className="upload-success">
          <div className="shell upload-page-shell">
            <div className="upload-success-card">
              <div className="upload-success-icon"><Check size={28} strokeWidth={3} /></div>
              <span className="upload-kicker">Abhimanyu Learning Space · Upload</span>
              <h1>Resource <em>submitted.</em></h1>
              <p>Your contribution has been queued for moderation. Once approved, students will be able to discover it through the Learning Space.</p>
              <div className="upload-success-meta">
                <span><ShieldCheck size={15} /> Moderation required</span>
                {fileName && <span><FileText size={15} /> {fileName}</span>}
              </div>
              <a className="upload-primary-btn" href="/resources">
                Back to Learning Space <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="upload-page">
        <section className="upload-hero">
          <div className="shell upload-page-shell">
            <div className="upload-hero-grid">
              <div>
                <div className="upload-kicker">
                  <span className="upload-kicker-dot" />
                  Abhimanyu Learning Space
                </div>
                <h1>Share knowledge.<br /><em>Help someone learn.</em></h1>
                <p>Upload notes, question papers and useful study material so CUSAT students can find the right resource at the right time.</p>
                <div className="upload-hero-tags">
                  <span><ShieldCheck size={14} /> Reviewed before publishing</span>
                  <span><BookOpen size={14} /> Course organised</span>
                </div>
              </div>
              <div className="upload-hero-art" aria-hidden="true">
                <div className="upload-art-orbit upload-art-orbit-one" />
                <div className="upload-art-orbit upload-art-orbit-two" />
                <div className="upload-art-stack">
                  <span /><span /><span />
                  <BookOpen size={54} strokeWidth={1.5} />
                </div>
                <div className="upload-art-badge"><UploadCloud size={17} /> Share a resource</div>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-section">
          <div className="shell upload-page-shell">
            <div className="upload-layout">
              <div className="upload-form-card">
                <div className="upload-form-heading">
                  <div className="upload-section-icon"><Layers3 size={22} /></div>
                  <div>
                    <span>01 · Resource details</span>
                    <h2>Tell us about the resource</h2>
                    <p>This helps students discover it through the right department, programme, semester and course.</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                  <div className="upload-form-grid">
                    <AcademicSelectors
                      departmentId={departmentId}
                      programmeId={programmeId}
                      onDepartmentChange={(value) => {
                        setDepartmentId(value);
                        setProgrammeId("");
                      }}
                      onProgrammeChange={setProgrammeId}
                      showCourseName
                      courseName={courseName}
                      onCourseNameChange={setCourseName}
                      courseNameRequired
                      showSemester
                      semester={semester}
                      onSemesterChange={setSemester}
                      semesterRequired
                    />

                    <label className="upload-field">
                      <span><CalendarDays size={16} /> Academic year / batch</span>
                      <input placeholder="2026–27" />
                    </label>

                    <label className="upload-field">
                      <span><Tag size={16} /> Course code</span>
                      <input placeholder="e.g. STA101" />
                    </label>

                    <label className="upload-field">
                      <span><FileText size={16} /> Resource type <b>*</b></span>
                      <div className="upload-control-wrap">
                        <select required defaultValue="Notes">
                          <option>Notes</option>
                          <option>Question Paper</option>
                          <option>Syllabus</option>
                          <option>Academic Update</option>
                        </select>
                        <ChevronDown size={17} />
                      </div>
                    </label>

                    <label className="upload-field">
                      <span><CalendarDays size={16} /> Exam / resource year</span>
                      <input placeholder="2026" />
                    </label>

                    <label className="upload-field upload-field-full">
                      <span><FileText size={16} /> Resource title <b>*</b></span>
                      <input required placeholder="e.g. Probability Theory — Unit 1 Notes" />
                    </label>
                  </div>

                  <div className="upload-divider" />

                  <div className="upload-file-heading">
                    <div>
                      <span className="upload-step">02 · Upload file</span>
                      <h3>Add the material students will use</h3>
                    </div>
                    {fileName && <span className="upload-file-ready"><Check size={14} /> Ready</span>}
                  </div>

                  <label
                    className={`upload-dropzone ${fileName ? "has-file" : ""}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
                  >
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    {fileName ? (
                      <>
                        <div className="upload-file-icon"><FileText size={25} /></div>
                        <div className="upload-drop-copy">
                          <strong>{fileName}</strong>
                          <span>{fileSize} · File selected successfully</span>
                        </div>
                        <button type="button" className="upload-remove" onClick={(e) => { e.preventDefault(); setFileName(""); setFileSize(""); }}>
                          <X size={17} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="upload-cloud"><UploadCloud size={27} /></div>
                        <div className="upload-drop-copy">
                          <strong>Choose a file</strong>
                          <span>or drag and drop it here</span>
                          <small>PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX or TXT</small>
                        </div>
                        <span className="upload-browse">Browse</span>
                      </>
                    )}
                  </label>

                  <label className="upload-consent">
                    <input type="checkbox" required />
                    <span className="upload-check"><Check size={14} /></span>
                    <span>I have the right to share this material and it does not contain unauthorised copyrighted content.</span>
                  </label>

                  <div className="upload-submit-row">
                    <div>
                      <span className="upload-submit-note"><ShieldCheck size={14} /> Your upload will be reviewed before it appears publicly.</span>
                    </div>
                    <button className="upload-primary-btn" type="submit">
                      Submit for moderation <Send size={17} />
                    </button>
                  </div>
                </form>
              </div>

              <aside className="upload-side">
                <div className="upload-side-card upload-side-guide">
                  <span className="upload-side-number">03</span>
                  <div className="upload-side-icon"><BookOpen size={21} /></div>
                  <span className="upload-side-kicker">Make it useful</span>
                  <h3>Help another student find it quickly.</h3>
                  <p>Use the official department and programme, then add the exact course/subject name. Good metadata makes the Learning Space much easier to search and later powers subject-specific AI.</p>
                  <div className="upload-tips">
                    <div><Check size={15} /> Choose the official department</div>
                    <div><Check size={15} /> Choose the matching programme</div>
                    <div><Check size={15} /> Add the exact course / subject</div>
                    <div><Check size={15} /> Mention the semester and year</div>
                  </div>
                </div>

                <div className="upload-side-card upload-side-moderation">
                  <ShieldCheck size={22} />
                  <div>
                    <strong>Why moderation?</strong>
                    <p>Uploads are checked before publication to keep the shared library useful and trustworthy.</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
