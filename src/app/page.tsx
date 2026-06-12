import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SetupBanner } from "@/components/SetupBanner";
import { listQuotes } from "@/lib/store";
import { formatZar, quoteTotals } from "@/lib/quote-schema";
import { getSession } from "@/lib/auth/session";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CHIP: Record<string, string> = {
  draft: "chip-neutral",
  sent: "chip-blue",
  accepted: "chip-green",
  declined: "chip-red",
};

export default async function HomePage() {
  const session = await getSession();
  const quotes = await listQuotes(session?.contractorId ?? undefined);

  const totalValue = quotes.reduce((sum, q) => sum + quoteTotals(q).total, 0);
  const acceptedCount = quotes.filter((q) => q.status === "accepted").length;
  const sentCount = quotes.filter((q) => q.status === "sent").length;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col px-5 py-8">
      <Nav />
      <SetupBanner />

      {/* Hero */}
      <header className="mb-10 page-enter">
        <div className="chip chip-amber mb-5">South Africa 🇿🇦</div>
        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.1] text-white sm:text-5xl">
          Site to quote<span className="text-amber-400">,</span>
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            in minutes.
          </span>
        </h1>
        <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-lg">
          Record a walkthrough or voice note — AI extracts materials, fetches live
          SA supplier prices, and delivers a VAT-ready quote.
        </p>
      </header>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3 page-enter stagger-1">
        <Link href="/record" className="btn-primary text-lg py-5 px-8 rounded-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          New quote from voice / video
        </Link>
      </div>

      {!session && (
        <div className="page-enter stagger-2 mt-6">
          <div className="glass-static p-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">
              <Link href="/register" className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                Create a free account
              </Link>{" "}
              to save quotes and set your labour rates.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      {quotes.length > 0 && (
        <div className="mt-10 grid grid-cols-3 gap-3 page-enter stagger-2">
          <div className="stat-card">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quotes</p>
            <p className="text-3xl font-black text-white">{quotes.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              {sentCount > 0 ? "Sent" : "Accepted"}
            </p>
            <p className="text-3xl font-black text-amber-400">
              {sentCount > 0 ? sentCount : acceptedCount}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Pipeline</p>
            <p className="text-lg font-black text-white leading-tight mt-1">{formatZar(totalValue)}</p>
          </div>
        </div>
      )}

      {/* Recent quotes */}
      <section className="mt-10 page-enter stagger-3">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
            Recent quotes
          </h2>
          <div className="divider flex-1" />
          {quotes.length > 0 && (
            <span className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
              {quotes.length} total
            </span>
          )}
        </div>

        {quotes.length === 0 ? (
          <div className="glass-static p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <svg className="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-bold text-white text-lg mb-2">No quotes yet</h3>
            <p className="text-sm text-zinc-500 mb-8 max-w-xs mx-auto leading-relaxed">
              Record a voice note or video walkthrough of the job site — we'll build your quote.
            </p>
            <div className="grid grid-cols-3 gap-5">
              {[
                { n: "1", title: "Record site", desc: "Voice note or video walkthrough" },
                { n: "2", title: "AI extracts", desc: "Materials, labour & quantities" },
                { n: "3", title: "Quote ready", desc: "Live SA supplier prices applied" },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/12 text-amber-400 text-sm font-black border border-amber-500/20">
                    {s.n}
                  </div>
                  <p className="text-xs font-bold text-zinc-300">{s.title}</p>
                  <p className="text-xs text-zinc-600 leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const { total } = quoteTotals(q);
              return (
                <li key={q.id}>
                  <Link href={`/quotes/${q.id}`} className="glass block p-5 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white/90 group-hover:text-white transition-colors truncate text-base">
                          {q.jobTitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          {q.clientName && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              {q.clientName}
                            </span>
                          )}
                          <span className="text-xs text-zinc-600">{fmtDate(q.createdAt)}</span>
                          <span className="text-xs text-zinc-600">{q.lineItems.length} items</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`chip text-[10px] ${STATUS_CHIP[q.status] ?? "chip-neutral"}`}>
                          {q.status}
                        </span>
                        <span className="text-amber-400 font-bold text-sm tracking-tight">
                          {formatZar(total)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/[0.04]">
                      <span className="text-xs text-zinc-600 group-hover:text-zinc-500 flex items-center gap-1 transition-colors">
                        View quote
                        <svg className="w-3.5 h-3.5 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="mt-auto pt-12 pb-6 text-center page-enter stagger-4">
        <div className="divider mb-6" />
        <p className="text-[11px] text-zinc-600 font-medium tracking-wide">
          Live pricing · Builders · Cashbuild · Build It · Leroy Merlin · BUCO · Plumblink
        </p>
      </footer>
    </main>
  );
}
