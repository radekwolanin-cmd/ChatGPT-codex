import { twMerge } from "tailwind-merge";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={twMerge("rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
    </div>
  );
}
