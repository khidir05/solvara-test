"use client";

import { useState } from "react";
import { createTicket } from "../../lib/api";

export default function SubmitTicketPage() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const res = await createTicket(content);
      setMessage(`Ticket #${res.id} created successfully.`);
      setContent("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <a href="/" className="text-sm text-sky-400 hover:text-sky-300">
        ← Back to dashboard
      </a>

      <div className="max-w-2xl space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Submit Test Ticket
          </h2>
          <p className="text-sm text-slate-300">
            Use this form to create complaints and exercise the triage flow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm text-slate-200">
            Complaint content
            <textarea
              className="mt-1 min-h-[160px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe a billing, technical, or feature-related problem here..."
              required
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
            {message && (
              <p className="text-xs text-emerald-300">
                {message}
              </p>
            )}
            {error && (
              <p className="text-xs text-rose-300">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

