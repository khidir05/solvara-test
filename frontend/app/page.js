import TicketCard from "../components/TicketCard";
import { fetchTickets } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let tickets = [];
  try {
    tickets = await fetchTickets();
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Ticket Dashboard
          </h2>
          <p className="text-sm text-slate-300">
            Monitor incoming tickets, AI triage results, and resolution status.
          </p>
        </div>
        <a
          href="/submit"
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow hover:bg-sky-400"
        >
          New Test Ticket
        </a>
      </div>

      {tickets.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300">
          No tickets yet. Use the{" "}
          <span className="font-semibold">Submit Ticket</span> page to create
          one.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

