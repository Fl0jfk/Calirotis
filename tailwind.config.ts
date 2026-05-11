import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          50: "#fdf2f2",
          100: "#fce2e2",
          200: "#f9c5c5",
          300: "#f49898",
          400: "#ec5f5f",
          600: "#c01a1a",
          700: "#8b1a1a",
          800: "#721616",
        },
        safran: {
          100: "#fef3c7",
          400: "#f9b827",
          500: "#e8a030",
          600: "#d4893c",
          700: "#b36a28",
        },
        ardoise: {
          100: "#f1f3f5",
          300: "#dee2e6",
          400: "#ced4da",
          500: "#adb5bd",
          600: "#868e96",
          700: "#495057",
          800: "#343a40",
          900: "#212529",
        },
        creme: {
          50: "#fdfaf5",
          100: "#f9f3e6",
          200: "#f2e5cc",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        hand: ["var(--font-display)", "serif"],
        body: [
          "var(--font-body)",
          "sans-serif",
        ],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;

