import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Search } from "lucide-react";

interface TopbarProps {
  user: { name?: string | null; email?: string | null };
  defaultSearch?: string;
}

export function Topbar({ user, defaultSearch }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200/70 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
        <Search className="h-4 w-4 text-slate-400 dark:text-slate-300" />
        <input
          name="q"
          defaultValue={defaultSearch}
          placeholder="Search projects, tags, customers"
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
        />
      </div>
      <div className="ml-4 flex items-center gap-3">
        <ThemeToggle />
        <UserMenu name={user.name} email={user.email} />
      </div>
    </header>
  );
}
