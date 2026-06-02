"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Invalid password.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
      setSubmitting(false);
    }
  }

  return (
    <section className="container-wide py-20">
      <div className="max-w-md mx-auto glass rounded-3xl ring-soft p-6 sm:p-8">
        <div className="chip">Admin</div>
        <h1 className="mt-3 h-display text-2xl font-bold">Restricted area.</h1>
        <p className="mt-1 text-sm text-white/55">
          Enter the admin password to view FanMap operations.
        </p>

        {!configured && (
          <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <code>ADMIN_PASSWORD</code> is not set in the server environment. Sign-in will fail
            until it's configured.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-neon-cyan/60 focus:ring-2 focus:ring-neon-cyan/20"
            autoComplete="current-password"
          />
          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in…" : "Enter"}
          </button>
        </form>
      </div>
    </section>
  );
}
