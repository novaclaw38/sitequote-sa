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
      <div className="mt-10 p-6 glass-static border-amber-500/20 text-center animate-pulse">
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
          You {status === "accepted" ? "accepted" : "declined"} this quote.
        </p>
        <p className="text-xs text-zinc-500 mt-1">Thank you for your response.</p>
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
        className="btn-success text-sm py-3.5 px-8 font-bold text-white"
      >
        {loading && <span className="spinner" />}
        Accept quote
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => respond("declined")}
        className="btn-secondary text-sm py-3.5 px-8 font-bold text-zinc-400 hover:text-white"
      >
        Decline
      </button>
    </div>
  );
}
