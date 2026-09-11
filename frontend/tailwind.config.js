/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#071a18",
        panel: "#0d2925",
        mint: "#57e3b4",
        sun: "#f6c453",
        coral: "#ff8066"
      },
      boxShadow: {
        soft: "0 20px 50px rgba(0, 0, 0, 0.18)"
      }
    }
  },
  plugins: []
};
