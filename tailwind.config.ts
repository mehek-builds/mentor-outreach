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
        brand: "#E0552D",
        accent: "#E0552D",
        active: "#3B6FE0",
        positive: "#15803D",
        warn: "#B45309",
        danger: "#B91C1C",
        "stage-queued": "#0A0A0A",
        "stage-writing": "#9CC1E4",
        "stage-enhancing": "#6366F1",
        "stage-ready": "#F0542D",
        "stage-published": "#F5C84B",
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
