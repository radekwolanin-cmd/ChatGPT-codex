import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    const styles = {
      primary: "bg-brand-500 text-white shadow-card hover:bg-brand-400 focus-visible:outline-brand-200",
      secondary: "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white/50",
      ghost: "text-slate-200 hover:bg-white/10 focus-visible:outline-white/30",
    };
    return <button ref={ref} className={twMerge(base, styles[variant], className)} {...props} />;
  }
);

Button.displayName = "Button";
