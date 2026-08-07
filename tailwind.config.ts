import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand golds & accent stay fixed across themes
        gold: "#E8C766",
        "gold-light": "#F7E9B0",
        "gold-dark": "#C9A227",
        accent: "#F43F5E",
        // Theme-aware neutrals (driven by CSS variables in globals.css → light/dark)
        dark: "rgb(var(--c-bg) / <alpha-value>)",
        darker: "rgb(var(--c-bg-deep) / <alpha-value>)",
        "dark-card": "rgb(var(--c-card) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        white: "rgb(var(--c-fg) / <alpha-value>)", // makes text-white/xx flip with the theme
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-space)", "sans-serif"],
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
