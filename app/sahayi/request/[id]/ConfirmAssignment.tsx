"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Props = {
  assignmentId: string;
  status: string;
  volunteerConfirmed: boolean;
};

export default function ConfirmAssignment({
  assignmentId,
  status,
  volunteerConfirmed,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (status === "confirmed" || status === "completed") {
    return null;
  }

  if (status === "declined" || status === "cancelled") {
    return null;
  }

  async function confirm() {
    setBusy(true);

    const supabase = createBrowserClient();

    const { data: assignment } = await supabase
      .from("scribe_assignments")
      .select("volunteer_confirmed_at")
      .eq("id", assignmentId)
      .maybeSingle();

    const nextStatus = assignment?.volunteer_confirmed_at
      ? "confirmed"
      : "requester_confirmed";

    const { error } = await supabase
      .from("scribe_assignments")
      .update({
        status: nextStatus,
        requester_confirmed_at: new Date().toISOString(),
      })
      .eq("id", assignmentId);

    setBusy(false);
    setMsg(error ? error.message : "You confirmed this assignment. Refreshing…");

    if (!error) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }

  return (
    <div className="actions" style={{ marginTop: 12 }}>
      <button
        className="btn primary"
        disabled={busy}
        onClick={confirm}
      >
        {busy
          ? "Confirming…"
          : volunteerConfirmed
            ? "Confirm assignment"
            : "Confirm availability"}
      </button>

      {msg ? <span className="chip">{msg}</span> : null}
    </div>
  );
}
