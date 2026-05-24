import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SetupBanner } from "@/components/SetupBanner";
import { listQuotes } from "@/lib/store";
import { formatZar, quoteTotals } from "@/lib/quote-schema";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();
  const quotes = await listQuotes(session?.contractorId ?? undefined);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-1 flex-col px-5 py-8">
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
        <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-md">
          Record a walkthrough or voice note — we extract materials, fetch live
          supplier prices, and deliver a VAT-ready quote.
        </p>
      </header>

      {/* CTA */}
      <div className="page-enter stagger-1">
        <Link href="/record" className="btn-primary w-full text-lg py-5 rounded-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          New quote from voice / video
        </Link>
      </div>

      {!session && (
        <div className="page-enter stagger-2 mt-6">
          <div className="glass-static p-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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

      {/* Recent quotes */}
      <section className="mt-10 page-enter stagger-3">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
            Recent quotes
          </h2>
          <div className="divider flex-1" />
        </div>

        {quotes.length === 0 ? (
          <div className="glass-static p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
              <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <p className="text-sm text-zinc-500 font-medium">No quotes yet</p>
            <p className="text-xs text-zinc-600 mt-1">Start recording to create your first quote.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const { total } = quoteTotals(q);
              return (
                <li key={q.id}>
                  <Link href={`/quotes/${q.id}`} className="glass block p-5 group">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white/90 group-hover:text-white transition-colors">
                        {q.jobTitle}
                      </p>
                      <svg className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-all transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-amber-400 font-semibold text-sm tracking-tight">
                        {formatZar(total)}
                      </span>
                      <span className={`chip text-[10px] ${
                        q.status === "sent" ? "chip-blue" :
                        q.status === "accepted" ? "chip-green" :
                        "chip-neutral"
                      }`}>
                        {q.status}
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
          Live pricing from Builders · Cashbuild · Build It · Leroy Merlin · BUCO · Plumblink
        </p>
      </footer>
    </main>
  );
}
