import { twMerge } from "tailwind-merge";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const styles = {
    default: "bg-brand-500/20 text-brand-100",
    success: "bg-emerald-500/20 text-emerald-200",
    warning: "bg-amber-500/20 text-amber-200",
    danger: "bg-rose-500/20 text-rose-200",
    outline: "border border-white/20 text-slate-200",
  } satisfies Record<string, string>;
  return (
    <span className={twMerge("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
