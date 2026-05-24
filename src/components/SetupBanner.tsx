import { getConfigStatus } from "@/lib/config-status";

export function SetupBanner() {
  const status = getConfigStatus();
  if (status.ready) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-semibold">Setup incomplete</p>
      <p className="mt-1 text-amber-200/80">
        Add these in Vercel → Settings → Environment Variables, then redeploy:
      </p>
      <ul className="mt-2 list-inside list-disc text-amber-200/90">
        {status.missing.map((key) => (
          <li key={key}>{key}</li>
        ))}
      </ul>
      {!status.serper && !status.missing.includes("SERPER_API_KEY") && (
        <p className="mt-2 text-xs text-amber-200/60">
          SERPER_API_KEY optional — without it, supplier prices use estimates.
        </p>
      )}
    </div>
  );
}
