/** @type {import('tailwindcss').Config} */
export default {
  // Scan semua file JS/JSX untuk class yang digunakan
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Tambahkan custom color atau spacing jika diperlukan
    },
  },
  plugins: [],
};