import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        bg: { DEFAULT: "#0a0f1e", 2: "#111827", 3: "#1a2235" },
        card: { DEFAULT: "#141d2e", 2: "#1c2640" },
        brand: {
          green: "#22c55e",
          green2: "#4ade80",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          gold: "#f59e0b",
          red: "#ef4444",
          pink: "#ec4899",
          teal: "#14b8a6",
          orange: "#f97316",
        },
        line: "rgba(255,255,255,0.08)",
      },
      borderRadius: { xl2: "20px", xl3: "28px" },
    },
  },
  plugins: [],
};
export default config;
