import { twMerge } from "tailwind-merge";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
