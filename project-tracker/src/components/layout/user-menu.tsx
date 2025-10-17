"use client";

import { signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-card transition hover:border-slate-400 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10"
      >
        <span className="truncate max-w-[8rem]">{name ?? email ?? "Account"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 w-48 rounded-xl border border-slate-200/70 bg-white p-3 text-sm shadow-elevated dark:border-white/10 dark:bg-slate-950/95">
          <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            Signed in as
            <div className="truncate text-slate-700 dark:text-slate-200">{email}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-400"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
