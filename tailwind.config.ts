import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0D0C0B",
        "ink-2": "#0B0A09",
        surface: "#14110F",
        "surface-hover": "#1C1916",
        border: "#272320",
        cream: "#F2EFE9",
        body: "#E8E3DB",
        secondary: "#B8AFA4",
        tertiary: "#8A847D",
        accent: "#4FA6E8",
        "accent-bright": "#78BEF5",
      },
      fontFamily: {
        display: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["17px", { lineHeight: "1.6" }],
        lg: ["20px", { lineHeight: "28px" }],
        xl: ["28px", { lineHeight: "36px" }],
        "2xl": ["48px", { lineHeight: "52px" }],
        "3xl": ["72px", { lineHeight: "64px" }],
      },
      maxWidth: { content: "1320px" },
      borderRadius: { card: "3px", ctl: "2px" },
      zIndex: { "1": "1", "2": "2", "3": "3", nav: "900", overlay: "950" },
    },
  },
  plugins: [],
};

export default config;
