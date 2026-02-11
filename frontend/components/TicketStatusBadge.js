export default function TicketStatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();

  const styles = {
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    PROCESSED: "bg-sky-500/10 text-sky-300 border-sky-500/40",
    FAILED: "bg-rose-500/10 text-rose-300 border-rose-500/40",
    RESOLVED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  };

  const label = normalized || "UNKNOWN";
  const color =
    styles[normalized] || "bg-slate-700/60 text-slate-200 border-slate-500/60";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${color}`}
    >
      {label}
    </span>
  );
}

