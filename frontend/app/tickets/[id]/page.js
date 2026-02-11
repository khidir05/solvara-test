"use client";

import { use,useEffect, useState } from "react";
import { fetchTicket, updateTicket } from "../../../lib/api";
import TicketStatusBadge from "../../../components/TicketStatusBadge";

export default function TicketDetailPage({ params }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [replyDraft, setReplyDraft] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTicket() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTicket(id);
        if (!isMounted) return;
        setTicket(data);
        setReplyDraft(data.replyDraft || "");
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError("Failed to load ticket.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTicket();
    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleResolve() {
    if (!ticket) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateTicket(id, {
        replyDraft: replyDraft || ticket.replyDraft || "",
        status: "RESOLVED",
      });
      setTicket(updated);
    } catch (err) {
      console.error(err);
      setError("Failed to resolve ticket.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-300">Loading ticket...</p>;
  }

  if (!ticket) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-300">
          Ticket not found or failed to load.
        </p>
        <a href="/" className="text-sm text-sky-400 hover:text-sky-300">
          Back to dashboard
        </a>
      </div>
    );
  }

  const createdAt = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : "";

  return (
    <div className="space-y-4">
      <a href="/" className="text-sm text-sky-400 hover:text-sky-300">
        ← Back to dashboard
      </a>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="font-mono text-xs text-slate-400">
                Ticket #{ticket.id}
              </span>
              <span className="text-xs text-slate-400">{createdAt}</span>
            </div>
            <p className="text-sm text-slate-50">{ticket.content}</p>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-900/70 p-2">
            <div className="font-semibold text-slate-200">Category</div>
            <div className="mt-1 text-slate-300">
              {ticket.category || "—"}
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/70 p-2">
            <div className="font-semibold text-slate-200">Urgency</div>
            <div className="mt-1 text-slate-300">
              {ticket.urgency || "Unknown"}
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/70 p-2">
            <div className="font-semibold text-slate-200">Sentiment</div>
            <div className="mt-1 text-slate-300">
              {typeof ticket.sentiment === "number"
                ? `${ticket.sentiment}/10`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            Reply Draft
          </h3>
          <span className="text-xs text-slate-400">
            Agent-editable response to send to the customer.
          </span>
        </div>
        <textarea
          className="min-h-[160px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          value={replyDraft}
          onChange={(e) => setReplyDraft(e.target.value)}
          placeholder="Write or refine the reply to the customer here..."
        />
        {error && (
          <p className="text-xs text-rose-300">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Current status: <span className="font-medium">{ticket.status}</span>
          </p>
          <button
            onClick={handleResolve}
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Resolving..." : "Resolve"}
          </button>
        </div>
      </div>
    </div>
  );
}

