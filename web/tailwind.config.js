/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "16px",
        "2xl": "24px"
      },
      colors: {
        canvas: "var(--canvas)",
        "surface-low": "var(--surface-low)",
        "surface-mid": "var(--surface-mid)",
        "surface-high": "var(--surface-high)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        accent: "var(--accent)",
        border: "var(--border)",
        "border-bright": "var(--border-bright)"
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        "shimmer": "shimmer 2s infinite linear"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};

