"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/layout/theme-provider";

export function ThemeToggle() {
  const { mode, toggle } = useThemeContext();
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
