"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Users, Settings } from "lucide-react";

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-col gap-4 border-r border-slate-200/60 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full bg-brand-500/80 dark:bg-brand-500/60" />
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">Project Tracker</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Workspace</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-brand-500 text-white shadow-card"
                  : "text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        <strong className="text-sm text-slate-800 dark:text-white">Tips</strong>
        <p className="mt-2">Drag cards in the board view to update status in real time.</p>
      </div>
    </aside>
  );
}
