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
        // PENTING: Gunakan nama service docker 'api-gateway', bukan localhost
        target: "http://api-gateway:80", 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});