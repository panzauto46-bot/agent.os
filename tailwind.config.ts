import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          tertiary: "#F3F4F6",
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
        "text-muted": "#9CA3AF",
        "accent-blue": {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
        },
        "accent-green": {
          DEFAULT: "#10B981",
          light: "#34D399",
        },
        "accent-red": "#EF4444",
        "accent-orange": "#F59E0B",
        "accent-purple": "#8B5CF6",
        seller: {
          DEFAULT: "#EA580C",
          bg: "#FFF7ED",
        },
        buyer: {
          DEFAULT: "#2563EB",
          bg: "#EFF6FF",
        },
      },
      animation: {
        "slide-in": "slide-in 0.35s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "typing-dot": "typing-dot 1.4s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      keyframes: {
        "slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "typing-dot": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
