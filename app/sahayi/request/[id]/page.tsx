import ConfirmAssignment from "./ConfirmAssignment";
import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function RequestStatus({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await createServerClient();
  const { data: auth } = await s.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");

  const { data: r } = await s
    .from("scribe_requests")
    .select("id,course_or_programme,paper_or_subject,exam_date,exam_time,duration,venue,language,status,created_at")
    .eq("id", id)
    .maybeSingle();
  if (!r) notFound();

  const { data: a } = await s
    .from("scribe_assignments")
    .select("id,status,volunteer_id,requester_confirmed_at,volunteer_confirmed_at,created_at")
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <main id="main-content" tabIndex={-1}>
        <section className="section">
          <div className="shell">
            <a href="/sahayi">← Sahayi</a>
            <div className="eyebrow" style={{ marginTop: 24 }}><i className="dot" /> Scribe request</div>
            <h1>{r.paper_or_subject}</h1>
            <div className="chips">
              <span className="chip">{r.status}</span>
              <span className="chip">{r.exam_date} · {r.exam_time}</span>
            </div>
            <article className="card" style={{ marginTop: 24 }}>
              <h3>Exam details</h3>
              <p>{r.course_or_programme} · {r.duration || "Duration not specified"}</p>
              <p>{r.venue || "Venue to be confirmed"} · {r.language || "Language to be confirmed"}</p>
            </article>
            <h2 style={{ marginTop: 30 }}>Assignment</h2>
            {a?.length ? a.map((x) => (
              <article className="card" style={{ marginTop: 12 }} key={x.id}>
                <div className="chips">
                  <span className="chip">{x.status}</span>
                  {x.volunteer_confirmed_at && <span className="chip">Volunteer confirmed</span>}
                  {x.requester_confirmed_at && <span className="chip">Requester confirmed</span>}
                </div>
                <p>Matching and confirmation are handled by Sahayi coordinators. Personal volunteer details are not displayed here unless the assignment is confirmed.</p>
                <ConfirmAssignment assignmentId={x.id} status={x.status} volunteerConfirmed={!!x.volunteer_confirmed_at} />
              </article>
            )) : (
              <div className="notice" style={{ marginTop: 12 }}>Your request is awaiting coordinator review and matching.</div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
