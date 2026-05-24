import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getContractorById } from "@/lib/contractors";

export async function Nav() {
  const session = await getSession();
  const contractor = session
    ? await getContractorById(session.contractorId)
    : null;

  return (
    <nav className="mb-6 flex items-center justify-between gap-4">
      <Link href="/" className="text-lg font-bold text-amber-500">
        SiteQuote
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {contractor ? (
          <>
            <span className="hidden text-zinc-500 sm:inline">
              {contractor.companyName}
            </span>
            <Link href="/price-list" className="text-zinc-400 hover:text-white">
              Prices
            </Link>
            <Link href="/settings" className="text-zinc-400 hover:text-white">
              Settings
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="text-zinc-400 hover:text-white">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700"
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
      <button type="submit" className="text-zinc-400 hover:text-white">
        Log out
      </button>
    </form>
  );
}
