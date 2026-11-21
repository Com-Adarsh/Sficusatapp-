"use client";

import PageShell from "../components/PageShell";
import { api } from "@/lib/convex-api";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Explain this topic from first principles.",
  "Give me a step-by-step solution approach.",
  "What are the key formulas I should remember?",
  "Quiz me with 5 questions on this topic.",
];

function AIPageContent() {
  const searchParams = useSearchParams();
  const profile = useQuery(api.platform.myAcademicProfile, signedIn === true ? {} : "skip");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [image, setImage] = useState<{ data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createSupabaseBrowserClient().auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
    });
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("subject");
    if (fromUrl) setSubject(fromUrl);
  }, [searchParams]);

  async function send(text = input) {
    const question = text.trim();
    if (!question || !subject.trim() || busy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          messages: nextMessages,
          image: image ? { data: image.data, mediaType: image.mediaType } : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to get an answer.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.text }]);
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setMessages(messages);
      setError(err instanceof Error ? err.message : "Unable to get an answer.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, GIF or WebP image.");
      return;
    }
    if (file.size > 3.75 * 1024 * 1024) {
      setError("Please choose an image under 3.75 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const data = result.includes(",") ? result.split(",")[1] : result;
      setImage({
        data,
        mediaType: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
        name: file.name,
      });
      setError("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <PageShell>
      <section className="hero compact">
        <div className="shell">
          <div className="eyebrow">Study Assistant</div>
          <h1>Ask, understand, <em>learn.</em></h1>
          <p>
            A student-run AI assistant for step-by-step academic explanations. Notes and syllabus grounding will be added in the next layer.
          </p>
          <div className="actions">
            <span className="chip">Not official CUSAT</span>
            <span className="chip">20 messages / day</span>
            {profile?.programme && <span className="chip">{profile.programme}{profile.semester ? ` · Semester ${profile.semester}` : ""}</span>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          {signedIn === null ? (
            <div className="authcard">
              <h2>Connecting your student session…</h2>
              <p>Securely checking your account before opening the Study Assistant.</p>
            </div>
          ) : signedIn === false ? (
            <div className="authcard">
              <h2>Sign in to use the Study Assistant</h2>
              <p>Your questions are tied to your student account and protected by a daily usage limit.</p>
              <a className="btn primary" href="/sign-in?next=/ai">Sign in</a>
            </div>
          ) : (
            <div className="card" style={{ maxWidth: 980, margin: "0 auto", padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 20, borderBottom: "1px solid var(--line, #ddd)" }}>
                <div className="formgrid">
                  <label>
                    Subject
                    <input
                      className="field"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Probability & Random Variables"
                    />
                  </label>
                </div>
              </div>

              <div style={{ minHeight: 430, maxHeight: "60vh", overflowY: "auto", padding: 20 }}>
                {messages.length === 0 ? (
                  <div style={{ padding: "32px 8px" }}>
                    <span className="chip">Start with a question</span>
                    <h2 style={{ marginTop: 12 }}>What are you studying?</h2>
                    <p>Ask for an explanation, a worked approach, a formula recap, or a quick quiz.</p>
                    <div className="grid2" style={{ marginTop: 18 }}>
                      {starterPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          className="card"
                          type="button"
                          onClick={() => setInput(prompt)}
                          style={{ textAlign: "left", cursor: "pointer" }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 16 }}>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        style={{
                          justifySelf: message.role === "user" ? "end" : "start",
                          maxWidth: "85%",
                          padding: "14px 16px",
                          borderRadius: 16,
                          background: message.role === "user" ? "var(--ink, #111)" : "var(--surface, #f5f5f5)",
                          color: message.role === "user" ? "white" : "inherit",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.6,
                        }}
                      >
                        <small style={{ opacity: 0.65 }}>{message.role === "user" ? "You" : "Study Assistant"}</small>
                        <div style={{ marginTop: 5 }}>{message.content}</div>
                      </div>
                    ))}
                    {busy && <div className="chip">Thinking…</div>}
                  </div>
                )}
              </div>

              <div style={{ padding: 16, borderTop: "1px solid var(--line, #ddd)" }}>
                {image && (
                  <div className="chip" style={{ marginBottom: 10 }}>
                    Image attached: {image.name} · <button type="button" onClick={() => setImage(null)}>remove</button>
                  </div>
                )}
                {error && <div className="notice" style={{ marginBottom: 12 }}><div className="icon" style={{ margin: 0 }}>!</div><div><strong>Could not send</strong><p>{error}</p></div></div>}
                <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    hidden
                    onChange={(e) => handleImage(e.target.files?.[0])}
                  />
                  <button className="btn" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>Photo</button>
                  <textarea
                    className="field"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder={subject ? `Ask about ${subject}…` : "Select a subject first…"}
                    rows={2}
                    style={{ flex: 1, resize: "vertical" }}
                  />
                  <button className="btn primary" type="button" onClick={() => void send()} disabled={busy || !input.trim() || !subject.trim()}>
                    {busy ? "Sending…" : "Ask AI"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                  <span>Do not share passwords, contact details or other sensitive information.</span>
                  {remaining !== null && <span>{remaining} messages left today</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}


export default function AIPage() {
  return (
    <Suspense fallback={<PageShell><section className="section"><div className="shell"><div className="card">Loading Study Assistant…</div></div></section></PageShell>}>
      <AIPageContent />
    </Suspense>
  );
}
