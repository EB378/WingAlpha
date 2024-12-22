import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      skew: {
        '45': '45deg',
      },
      translate: {
        '50': '12.5rem',
      },
      keyframes: {
        circleExpand: {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        border: {
          "0%": { "border-color": "rgb(255, 105, 180)" }, // Pink
          "25%": { "border-color": "rgb(138, 43, 226)" }, // Blue
          "50%": { "border-color": "rgb(75, 0, 130)" },   // Indigo
          "75%": { "border-color": "rgb(255, 105, 180)" }, // Pink
          "100%": { "border-color": "rgb(138, 43, 226)" }, // Blue
        },
      },
      animation: {
        circleExpand: "circleExpand 1s ease-out forwards",
        border: "border 2s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
