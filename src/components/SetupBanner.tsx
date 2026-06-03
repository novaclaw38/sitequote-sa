import { getConfigStatus } from "@/lib/config-status";

export function SetupBanner() {
  const status = getConfigStatus();
  if (status.ready) return null;

  return (
    <div className="page-enter mb-8 rounded-xl border border-amber-500/30 bg-slate-900 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-300">Setup incomplete</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Add these in Vercel → Settings → Environment Variables, then redeploy:
          </p>
          <ul className="mt-2 space-y-1">
            {status.missing.map((key) => (
              <li key={key} className="flex items-center gap-2 text-xs text-amber-300/90">
                <span className="h-1 w-1 rounded-full bg-amber-400/60" />
                <code className="font-mono">{key}</code>
              </li>
            ))}
          </ul>
          {!status.serper && !status.missing.includes("SERPER_API_KEY") && (
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              SERPER_API_KEY optional — without it, supplier prices use estimates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
