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
      <Link href="/" className="group flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950">
          S
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-white">
          SiteQuote
        </span>
      </Link>
      <div className="flex items-center gap-1 text-sm">
        {contractor ? (
          <>
            <span className="mr-2 hidden text-slate-500 sm:inline">
              {contractor.companyName}
            </span>
            <Link href="/price-list" className="btn-secondary !py-1.5 !px-3 !text-xs">
              Prices
            </Link>
            <Link href="/settings" className="btn-secondary !py-1.5 !px-3 !text-xs">
              Settings
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="btn-secondary !py-1.5 !px-3 !text-xs">
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-secondary !border-emerald-500/30 !px-3 !py-1.5 !text-xs !text-emerald-400 hover:!bg-emerald-500/10"
            >
              Sign up
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
      <button type="submit" className="btn-secondary !border-rose-600/30 !px-3 !py-1.5 !text-xs !text-rose-400 hover:!bg-rose-600/10">
        Log out
      </button>
    </form>
  );
}
