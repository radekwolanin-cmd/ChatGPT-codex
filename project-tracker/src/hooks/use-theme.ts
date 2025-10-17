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
      document.documentElement.dataset.theme = saved;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setMode("dark");
      document.documentElement.classList.add("dark");
      document.documentElement.dataset.theme = "dark";
    } else {
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  const update = (next: ThemeMode) => {
    setMode(next);
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.dataset.theme = next;
  };

  const toggle = () => {
    update(mode === "dark" ? "light" : "dark");
  };

  return [mode, update, toggle];
}
