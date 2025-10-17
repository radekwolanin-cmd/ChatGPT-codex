import { twMerge } from "tailwind-merge";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles = {
    default: "bg-brand-500/15 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100",
    success: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    warning: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    danger: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
    outline: "border border-slate-300 text-slate-600 dark:border-white/20 dark:text-slate-200",
  } satisfies Record<string, string>;
  return (
    <span className={twMerge("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
