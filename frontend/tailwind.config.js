/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#ecfdf5",  // emerald-50
          100: "#d1fae5",  // emerald-100
          200: "#a7f3d0",  // emerald-200
          300: "#6ee7b7",  // emerald-300
          400: "#34d399",  // emerald-400
          500: "#10b981",  // emerald-500
          600: "#059669",  // emerald-600  ← primary
          700: "#047857",  // emerald-700
          800: "#065f46",  // emerald-800
          900: "#064e3b",  // emerald-900
          accent: "#84cc16", // lime-500 for stars/highlights
        },
      },
    },
  },
  plugins: [],
};