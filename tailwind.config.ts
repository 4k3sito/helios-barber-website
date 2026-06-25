import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0B", // near-black background
        surface: "#141416", // cards
        line: "#26262A", // borders
        cream: "#F4F1EA", // off-white foreground
        muted: "#A1A1A6", // secondary text
        bronze: "#C9A24B", // premium accent / CTA
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "1200px" },
    },
  },
  plugins: [],
};

export default config;
