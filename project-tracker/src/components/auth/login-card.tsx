"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function LoginCard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await signIn("email", { email, redirect: false });
    setLoading(false);
    if (res?.error) {
      setMessage(res.error);
    } else {
      setMessage("Check your inbox for a sign-in link.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 text-slate-50 shadow-elevated backdrop-blur">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-200/80">Sign in with email or your connected provider.</p>
      <form onSubmit={handleEmailLogin} className="mt-6 space-y-3">
        <div>
          <label className="text-sm text-slate-200">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-base text-white outline-none transition focus:border-brand-400 focus:ring focus:ring-brand-500/20"
            placeholder="you@company.com"
          />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2 font-medium shadow-card transition hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send magic link"}
        </button>
      </form>
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={() => signIn("google")}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:bg-white/10"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn("azure-ad")}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:bg-white/10"
        >
          Continue with Azure AD
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-emerald-200">{message}</p>}
    </div>
  );
}
