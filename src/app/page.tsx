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
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col px-4 py-8">
      <Nav />
      <SetupBanner />

      <header className="mb-10 text-center fade-in-up">
        <div className="inline-block px-3 py-1 mb-4 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
          <p className="text-amber-400 text-xs font-bold tracking-widest uppercase">
            South Africa
          </p>
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-white to-zinc-400 drop-shadow-sm tracking-tight mb-4">
          SiteQuote
        </h1>
        <p className="mt-2 text-zinc-400 leading-relaxed text-lg font-light">
          Record a site walkthrough or voice note. We extract materials, look up
          live supplier prices, and return a <span className="text-amber-500/90 font-medium">VAT-ready quote</span>.
        </p>
      </header>

      <div className="fade-in-up delay-1">
        <Link
          href="/record"
          className="btn-glow mb-10 flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-black"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          New quote from voice / video
        </Link>
      </div>

      {!session && (
        <div className="fade-in-up delay-2">
          <p className="mb-8 rounded-xl border border-amber-500/20 bg-black/40 backdrop-blur-md px-5 py-4 text-sm text-amber-100/80 shadow-2xl">
            <Link href="/register" className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
              Create a free account
            </Link>{" "}
            to save quotes and set your labour rates.
          </p>
        </div>
      )}

      <section className="fade-in-up delay-3 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Recent quotes
          </h2>
          <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1 ml-4"></div>
        </div>
        
        {quotes.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-zinc-500 font-medium">No quotes yet — start recording.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const { total } = quoteTotals(q);
              return (
                <li key={q.id} className="group">
                  <Link
                    href={`/quotes/${q.id}`}
                    className="glass-panel block rounded-2xl px-5 py-4"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-zinc-100 group-hover:text-white transition-colors">{q.jobTitle}</p>
                      <svg className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-500 font-medium tracking-tight">
                        {formatZar(total)}
                      </span>
                      <span className="text-zinc-600 text-xs px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/50">
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

      <footer className="mt-auto pt-12 pb-4 text-center fade-in-up delay-3">
        <p className="text-xs text-zinc-600 font-medium tracking-wide">
          Powered by live pricing from
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          Builders, Cashbuild, Build It, Leroy Merlin, BUCO, Plumblink
        </p>
      </footer>
    </main>
  );
}
