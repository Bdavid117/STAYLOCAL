import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF5A5F",
          dark: "#E04148",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
