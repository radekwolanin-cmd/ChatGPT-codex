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
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white shadow-card transition hover:border-white/30 hover:bg-white/10"
      >
        <span className="truncate max-w-[8rem]">{name ?? email ?? "Account"}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 w-48 rounded-xl border border-white/10 bg-slate-950/95 p-3 text-sm shadow-elevated">
          <div className="mb-3 text-xs text-slate-400">
            Signed in as
            <div className="truncate text-slate-200">{email}</div>
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
