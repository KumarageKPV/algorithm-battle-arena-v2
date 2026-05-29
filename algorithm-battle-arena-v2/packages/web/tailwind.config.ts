import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "arena-gold": "#ffed4e",
        "arena-orange": "#ff6b00",
        "arena-pink": "#ff3366",
        "arena-crimson": "#6B0F1A",
        "arena-panel": "rgba(20, 20, 20, 0.85)",
        "arena-input": "rgba(30, 30, 30, 0.9)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui"],
        display: ["var(--font-display)", "system-ui"],
        mono: ["var(--font-mono)", "monospace"],
        arena: ["MK4", "Impact", "sans-serif"],
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
        "accordion-down": {
          "0%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0)" },
        },
        "accordion-up": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
