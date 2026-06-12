import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getContractorById } from "@/lib/contractors";

export async function Nav() {
  const session = await getSession();
  const contractor = session
    ? await getContractorById(session.contractorId)
    : null;

  return (
    <nav className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="group flex items-center gap-2.5 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 font-black text-black shadow-lg shadow-amber-500/25 text-xs leading-none">
          SQ
        </div>
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-[15px] font-bold text-white/90 group-hover:text-white transition-colors">
            SiteQuote
          </span>
          <span className="text-[9px] font-semibold text-amber-500/60 tracking-[0.12em] uppercase">
            South Africa
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {contractor ? (
          <>
            <span className="hidden text-zinc-600 text-xs sm:inline truncate max-w-[120px] mr-1">
              {contractor.companyName}
            </span>
            <Link
              href="/record"
              className="btn-primary !py-2 !px-3.5 !text-xs !rounded-xl hidden sm:inline-flex shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              New Quote
            </Link>
            <Link href="/price-list" className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">
              Prices
            </Link>
            <Link href="/settings" className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">
              Settings
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-primary !py-2 !px-4 !text-xs !rounded-xl shrink-0"
            >
              Sign up free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { destroySession } = await import("@/lib/auth/session");
        const { redirect } = await import("next/navigation");
        await destroySession();
        redirect("/");
      }}
    >
      <button
        type="submit"
        className="btn-secondary !py-1.5 !px-3 !text-xs !text-red-400 !border-red-500/20 hover:!bg-red-500/10 shrink-0"
      >
        Out
      </button>
    </form>
  );
}
