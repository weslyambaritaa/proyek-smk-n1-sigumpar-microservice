import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    // PENTING: Izinkan akses dari luar kontainer (Host OS)
    host: "0.0.0.0",
    port: 5173,

    // Konfigurasi Watch agar hot-reload jalan di Docker (Windows/WSL)
    watch: {
      usePolling: true,
    },

    proxy: {
      "/api": {
        target: "http://api-gateway:80", // ← harus nama service Docker
        changeOrigin: true,
      },
    },
  },
});
