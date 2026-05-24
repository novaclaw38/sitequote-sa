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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-black text-black shadow-lg shadow-amber-500/20">
          S
        </div>
        <span className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">
          SiteQuote
        </span>
      </Link>
      <div className="flex items-center gap-1 text-sm">
        {contractor ? (
          <>
            <span className="hidden text-zinc-500 sm:inline mr-2">
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
              className="btn-secondary !py-1.5 !px-3 !text-xs !border-amber-500/30 !text-amber-400 hover:!bg-amber-500/10"
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
      <button type="submit" className="btn-secondary !py-1.5 !px-3 !text-xs !text-red-400 !border-red-500/20 hover:!bg-red-500/10">
        Log out
      </button>
    </form>
  );
}
