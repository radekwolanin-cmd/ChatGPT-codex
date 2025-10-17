export const theme = {
  light: {
    background: "bg-slate-50",
    surface: "bg-white/80 backdrop-blur",
    border: "border-slate-200/80",
    textPrimary: "text-slate-900",
    textMuted: "text-slate-500",
  },
  dark: {
    background: "bg-slate-950",
    surface: "bg-slate-900/80 backdrop-blur",
    border: "border-slate-800",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-400",
  },
} as const;

export type ThemeMode = keyof typeof theme;
