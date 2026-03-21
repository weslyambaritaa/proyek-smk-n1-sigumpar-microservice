import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173, // Port development server

    /**
     * Proxy: Meneruskan request /api dari frontend ke Nginx
     * Ini menghindari masalah CORS saat development.
     * Di production, frontend dan API berada di domain/port yang sama.
     */
    proxy: {
      "/api": {
        target: "http://localhost:80", // Nginx API Gateway
        changeOrigin: true,            // Ubah header 'Origin' agar sesuai target
        secure: false,                 // Tidak perlu SSL untuk localhost
      },
    },
  },
});