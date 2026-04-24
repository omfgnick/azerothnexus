import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#060815",
        arcane: "#5aa9ff",
        void: "#8b5cf6",
        gold: "#d4a84f"
      },
      boxShadow: {
        glow: "0 0 40px rgba(90,169,255,0.18)"
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top, rgba(90,169,255,0.18), rgba(139,92,246,0.12), transparent 58%)"
      }
    }
  },
  plugins: []
} satisfies Config;
