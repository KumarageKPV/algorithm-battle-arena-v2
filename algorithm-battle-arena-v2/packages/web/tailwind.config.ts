import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "arena-gold": "#ffed4e",
        "arena-orange": "#ff6b00",
        "arena-pink": "#ff3366",
        "arena-crimson": "#6B0F1A",
        "arena-panel": "rgba(20, 20, 20, 0.85)",
        "arena-input": "rgba(30, 30, 30, 0.9)",
      },
      fontFamily: {
        arena: ["MK4", "Impact", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      boxShadow: {
        "glow-orange": "0 0 15px rgba(255, 107, 0, 0.5)",
        "glow-gold": "0 0 15px rgba(255, 237, 78, 0.5)",
        "glow-crimson": "0 0 15px rgba(107, 15, 26, 0.5)",
        "glow-green": "0 0 15px rgba(34, 197, 94, 0.5)",
        "glow-pink": "0 0 15px rgba(255, 51, 102, 0.5)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
      },
    },
  },
  plugins: [],
};
export default config;
