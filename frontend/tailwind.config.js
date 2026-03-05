/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#111113",
        secondary: "#1a1a1c",
        accent: "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(255, 255, 255, 0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};
