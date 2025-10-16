import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f6ff",
          100: "#e0e6ff",
          200: "#c5d1ff",
          300: "#9aaeff",
          400: "#6f86ff",
          500: "#4c5dff",
          600: "#3b46e6",
          700: "#3038b3",
          800: "#282f8a",
          900: "#22286c"
        }
      },
      boxShadow: {
        elevated: "0 20px 45px -20px rgba(15, 23, 42, 0.35)",
        card: "0 10px 25px -15px rgba(15, 23, 42, 0.35)"
      },
      backgroundImage: {
        "glow-gradient":
          "radial-gradient(circle at top, rgba(76,93,255,0.25), transparent 70%)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
