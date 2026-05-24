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

      <header className="mb-8">
        <p className="text-amber-500 text-sm font-semibold tracking-wide uppercase">
          South Africa
        </p>
        <h1 className="text-3xl font-bold text-white">SiteQuote</h1>
        <p className="mt-2 text-zinc-400">
          Record a site walkthrough or voice note. We extract materials, look up
          live supplier prices, and return a VAT-ready quote.
        </p>
      </header>

      <Link
        href="/record"
        className="mb-8 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-lg font-bold text-black hover:bg-amber-400"
      >
        New quote from voice / video
      </Link>

      {!session && (
        <p className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <Link href="/register" className="font-semibold underline">
            Create a free account
          </Link>{" "}
          to save quotes and set your labour rates.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500 uppercase tracking-wide">
          Recent quotes
        </h2>
        {quotes.length === 0 ? (
          <p className="text-zinc-500 text-sm">No quotes yet — start recording.</p>
        ) : (
          <ul className="space-y-2">
            {quotes.map((q) => {
              const { total } = quoteTotals(q);
              return (
                <li key={q.id}>
                  <Link
                    href={`/quotes/${q.id}`}
                    className="block rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 hover:border-amber-500/50"
                  >
                    <p className="font-medium text-white">{q.jobTitle}</p>
                    <p className="text-sm text-zinc-500">
                      {formatZar(total)} · {q.status}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="mt-auto pt-8 text-xs text-zinc-600">
        Suppliers: Builders, Cashbuild, Build It, Leroy Merlin, BUCO, Plumblink
      </footer>
    </main>
  );
}
