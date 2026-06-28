import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        surface: "#FFFFFF",
        "surface-alt": "#FAFAF8",
        border: "#EAEAE5",
        ink: "#0A0A0A",
        muted: "#737370",
        faint: "#A3A39E",
        brand: "#5B4FCF",
        active: "#5B4FCF",
        positive: "#15803D",
        warn: "#B45309",
        danger: "#B91C1C",
        "status-draft": "#A3A39E",
        "status-sent": "#3B6FE0",
        "status-replied": "#15803D",
        "status-bounced": "#B91C1C",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Menlo", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: { DEFAULT: "8px" },
    },
  },
  plugins: [],
};

export default config;
