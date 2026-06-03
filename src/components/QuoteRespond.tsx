"use client";

import { useState } from "react";

type Props = {
  token: string;
  initialStatus: string;
};

export function QuoteRespond({ token, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  if (status === "accepted" || status === "declined") {
    return (
      <div
        className={`glass-static mt-10 p-6 text-center ${
          status === "accepted" ? "border-emerald-500/30" : "border-slate-800"
        }`}
      >
        <p
          className={`text-lg font-semibold tracking-tight ${
            status === "accepted" ? "text-emerald-400" : "text-slate-300"
          }`}
        >
          You {status === "accepted" ? "accepted" : "declined"} this quote.
        </p>
        <p className="mt-1 text-xs text-slate-500">Thank you for your response.</p>
      </div>
    );
  }

  const respond = async (next: "accepted" | "declined") => {
    setLoading(true);
    const res = await fetch(`/api/public/quotes/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setStatus(next);
    setLoading(false);
  };

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        disabled={loading}
        onClick={() => respond("accepted")}
        className="btn-success px-8 py-3.5 text-sm"
      >
        {loading && <span className="spinner" />}
        Accept quote
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => respond("declined")}
        className="btn-secondary px-8 py-3.5 text-sm"
      >
        Decline
      </button>
    </div>
  );
}
