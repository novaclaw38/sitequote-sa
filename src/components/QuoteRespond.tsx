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
      <p className="mt-8 text-center text-lg font-medium text-amber-400">
        You {status === "accepted" ? "accepted" : "declined"} this quote.
      </p>
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
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        disabled={loading}
        onClick={() => respond("accepted")}
        className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
      >
        Accept quote
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => respond("declined")}
        className="rounded-xl border border-zinc-600 px-6 py-3 font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}
