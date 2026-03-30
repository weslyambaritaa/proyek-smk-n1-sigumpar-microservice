import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import keycloak from "./keycloak"; // Import konfigurasi yang baru Anda buat

// Global handler for chunk loading errors (network/cached stale bundle issue)
const shouldReloadForChunkError = (message) => {
  return /Loading chunk [0-9]+ failed|ChunkLoadError/i.test(message);
};

const reloadApp = () => {
  console.warn(
    "🔄 Detected chunk load failure, reloading application to recover.",
  );
  const separator = window.location.href.includes("?") ? "&" : "?";
  window.location.replace(
    `${window.location.href}${separator}reload=${Date.now()}`,
  );
};

window.addEventListener("error", (event) => {
  if (!event || !event.message) return;
  if (shouldReloadForChunkError(event.message)) {
    event.preventDefault();
    reloadApp();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (!event || !event.reason) return;
  const message = event.reason.message || String(event.reason);
  if (shouldReloadForChunkError(message)) {
    event.preventDefault();
    reloadApp();
  }
});

// Inisialisasi Keycloak
keycloak
  .init({
    onLoad: "login-required", // Memaksa login saat web dibuka
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    if (authenticated) {
      console.log("✅ User terautentikasi");
      // window.keycloak = keycloak;

      // Render aplikasi hanya setelah login berhasil
      createRoot(document.getElementById("root")).render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    } else {
      // Jika gagal autentikasi, refresh halaman
      window.location.reload();
    }
  })
  .catch((err) => {
    console.error("❌ Gagal inisialisasi Keycloak:", err);
    document.getElementById("root").innerHTML = `
    <div style="color: red; text-align: center; margin-top: 50px;">
      <h1>Gagal Terhubung ke Keycloak</h1>
      <p>Pastikan container Keycloak sudah jalan di http://localhost:8080</p>
    </div>
  `;
  });
