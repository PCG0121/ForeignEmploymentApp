/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/*.html", // Scan HTML files directly in 'public' folder
    "./public/js/*.js" // Scan JS files for dynamic class additions
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}