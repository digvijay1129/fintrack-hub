/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212f",
        muted: "#6d7786",
        canvas: "#f6f8fb",
        brand: {
          50: "#edf8f5",
          100: "#d4f0e8",
          500: "#16866f",
          600: "#10745f",
          700: "#0e5b4c"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(25, 45, 65, 0.06)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
