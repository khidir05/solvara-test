import "./globals.css";

export const metadata = {
  title: "Triage & Recovery Hub",
  description: "Agent dashboard for ticket triage and recovery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
            <h1 className="text-xl font-semibold tracking-tight">
              Triage &amp; Recovery Hub
            </h1>
            <nav className="flex gap-4 text-sm text-slate-300">
              <a href="/" className="hover:text-white">
                Dashboard
              </a>
              <a href="/submit" className="hover:text-white">
                Submit Ticket
              </a>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}

