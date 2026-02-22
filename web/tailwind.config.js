/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "16px"
      },
      spacing: {
        18: "4.5rem"
      },
      colors: {
        canvas: "var(--canvas)",
        panel: "var(--panel)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        border: "var(--border)"
      }
    }
  },
  plugins: []
};
