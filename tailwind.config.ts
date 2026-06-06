import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#111118",
        panel: "#16161f",
        border: "#1e1e2e",
        accent: "#ff3c3c",
        "accent-dim": "#cc2222",
        glow: "#ff3c3c33",
        muted: "#3a3a4a",
        text: "#e8e8f0",
        "text-dim": "#7a7a9a",
        green: "#22ff88",
        blue: "#3c8eff",
        gold: "#ffb800",
      },
      boxShadow: {
        glow: "0 0 20px #ff3c3c44",
        "glow-sm": "0 0 10px #ff3c3c33",
        panel: "0 4px 24px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,60,60,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,60,60,0.03) 1px, transparent 1px)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,60,60,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px #ff3c3c33" },
          "50%": { boxShadow: "0 0 24px #ff3c3c66" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
