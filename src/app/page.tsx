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
        <div className="chip chip-green mb-5">South Africa 🇿🇦</div>
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
          Site to quote<span className="text-emerald-400">,</span>
          <br />
          <span className="text-emerald-400">in minutes.</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
          Record a walkthrough or voice note — we extract materials, fetch live
          supplier prices, and deliver a VAT-ready quote.
        </p>
      </header>

      {/* CTA */}
      <div className="page-enter stagger-1 space-y-3">
        <Link href="/record" className="btn-primary w-full py-4 text-base">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          New quote from voice / video
        </Link>
        <Link href="/templates" className="btn-secondary w-full py-3.5">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          Start from a job template
        </Link>
      </div>

      {!session && (
        <div className="page-enter stagger-2 mt-6">
          <div className="glass-static flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <p className="text-sm text-slate-400">
              <Link href="/register" className="font-medium text-emerald-400 underline underline-offset-2 transition-colors hover:text-emerald-300">
                Create a free account
              </Link>{" "}
              to save quotes and set your labour rates.
            </p>
          </div>
        </div>
      )}

      {/* Recent quotes */}
      <section className="mt-10 page-enter stagger-3">
        <div className="mb-5 flex items-center gap-4">
          <h2 className="whitespace-nowrap text-xs font-medium uppercase tracking-widest text-slate-500">
            Recent quotes
          </h2>
          <div className="divider flex-1" />
        </div>

        {quotes.length === 0 ? (
          <div className="glass-static p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-400">No quotes yet</p>
            <p className="mt-1 text-xs text-slate-600">Start recording to create your first quote.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const { total } = quoteTotals(q);
              return (
                <li key={q.id}>
                  <Link href={`/quotes/${q.id}`} className="glass group block p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-100 transition-colors group-hover:text-white">
                        {q.jobTitle}
                      </p>
                      <svg className="h-4 w-4 transform text-slate-600 transition-all duration-200 ease-in-out group-hover:translate-x-0.5 group-hover:text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="num text-sm text-emerald-400">
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

      <footer className="page-enter stagger-4 mt-auto pb-6 pt-12 text-center">
        <div className="divider mb-6" />
        <p className="text-[11px] font-medium tracking-wide text-slate-600">
          Live pricing from Builders · Cashbuild · Build It · Leroy Merlin · BUCO · Plumblink
        </p>
      </footer>
    </main>
  );
}
