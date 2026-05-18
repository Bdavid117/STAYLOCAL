import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bone: {
          DEFAULT: "var(--bone)",
          2: "var(--bone-2)",
        },
        paper: "var(--paper)",
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
          mute: "var(--ink-mute)",
        },
        terracotta: {
          DEFAULT: "var(--terracotta)",
          deep: "var(--terracotta-deep)",
        },
        moss: "var(--moss)",
        ochre: "var(--ochre)",
        line: {
          DEFAULT: "var(--line)",
          soft: "var(--line-soft)",
          hair: "var(--line-hairline)",
        },
        // Compat — legado del scaffold (algunos lugares aún usan `brand`).
        brand: {
          DEFAULT: "var(--terracotta)",
          dark: "var(--terracotta-deep)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        md: "6px",
        lg: "10px",
        xl: "16px",
        "2xl": "22px",
      },
      boxShadow: {
        soft: "0 1px 0 rgba(26,22,18,0.04), 0 8px 24px -16px rgba(26,22,18,0.18)",
        warm: "0 24px 60px -28px rgba(184,83,66,0.32)",
      },
      maxWidth: {
        prose: "62ch",
        editorial: "76rem",
      },
      letterSpacing: {
        widest: "0.22em",
      },
    },
  },
  plugins: [],
} satisfies Config;
