import Link from "next/link";
import TicketStatusBadge from "./TicketStatusBadge";

function urgencyStyles(urgency) {
  const value = (urgency || "").toUpperCase();

  if (value === "HIGH") {
    return "border-rose-500/60 bg-rose-950/50";
  }
  if (value === "MEDIUM") {
    return "border-amber-500/60 bg-amber-950/40";
  }
  if (value === "LOW") {
    return "border-emerald-500/60 bg-emerald-950/40";
  }

  return "border-slate-700 bg-slate-900/60";
}

function urgencyLabel(urgency) {
  if (!urgency) return "Unknown";
  return urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase();
}

export default function TicketCard({ ticket }) {
  const createdAt = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : "";

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <article
        className={`flex h-full cursor-pointer flex-col rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-lg hover:shadow-sky-500/10 ${urgencyStyles(
          ticket.urgency
        )}`}
      >
        <header className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-mono text-xs text-slate-400">
              #{ticket.id}
            </span>
            <span className="truncate text-xs">{createdAt}</span>
          </div>
          <TicketStatusBadge status={ticket.status} />
        </header>
        <div className="mb-3 line-clamp-3 text-sm text-slate-100">
          {ticket.content}
        </div>
        <footer className="mt-auto flex items-center justify-between text-xs text-slate-300">
          <span className="rounded-full bg-slate-900/40 px-2 py-0.5">
            Urgency: {urgencyLabel(ticket.urgency)}
          </span>
          {typeof ticket.sentiment === "number" && (
            <span className="rounded-full bg-slate-900/40 px-2 py-0.5">
              Sentiment: {ticket.sentiment}/10
            </span>
          )}
        </footer>
      </article>
    </Link>
  );
}

