"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-12 page-enter">
      <Link href="/" className="btn-secondary !text-xs mb-8 self-start">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Home
      </Link>

      <div className="glass-static p-8 w-full">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to your SiteQuote account</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</span>
            <input
              type="email"
              required
              className="input mt-2"
              placeholder="you@company.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</span>
            <input
              type="password"
              required
              className="input mt-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2.5">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading && <span className="spinner" />}
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="divider my-6" />

        <p className="text-sm text-slate-500 text-center">
          No account?{" "}
          <Link href="/register" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
}
