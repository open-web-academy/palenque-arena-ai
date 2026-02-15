/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0A0A",
        charcoal: "#121212",
        gold: "#FFB800",
        "gold-dim": "rgba(255, 184, 0, 0.5)",
        "arena-red": "#FF3D3D",
        "arena-red-dim": "rgba(255, 61, 61, 0.5)",
        emerald: "#0A5E4A",
        "emerald-dim": "rgba(10, 94, 74, 0.5)",
        bronze: "#2B1A0F",
        "bronze-light": "#3d2614",
      },
      fontFamily: {
        display: ["Bebas Neue", "Orbitron", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        numeric: ["Orbitron", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 30px rgba(255, 184, 0, 0.4), 0 0 60px rgba(255, 184, 0, 0.15)",
        "red-glow": "0 0 30px rgba(255, 61, 61, 0.4), 0 0 60px rgba(255, 61, 61, 0.15)",
        "emerald-glow": "0 0 24px rgba(10, 94, 74, 0.5)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
