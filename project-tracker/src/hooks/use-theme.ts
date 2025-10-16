"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/styles/theme";

const THEME_KEY = "project-tracker-theme";

export function useTheme(): [ThemeMode, (mode: ThemeMode) => void, () => void] {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = (window.localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? undefined;
    if (saved) {
      setMode(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const update = (next: ThemeMode) => {
    setMode(next);
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const toggle = () => {
    update(mode === "dark" ? "light" : "dark");
  };

  return [mode, update, toggle];
}
