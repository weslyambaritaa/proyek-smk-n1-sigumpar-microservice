import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak'

// Memaksa user login ke Keycloak sebelum merender React
keycloak.init({ 
  onLoad: 'login-required', 
  checkLoginIframe: false 
}).then((authenticated) => {
  if (!authenticated) {
    window.location.reload();
  } else {
    console.log("✅ Berhasil Login via Keycloak!");
    // Opsional: Simpan token agar mudah digunakan saat nge-fetch API nanti
    localStorage.setItem("kc_token", keycloak.token);

    // Merender aplikasi React
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}).catch((err) => {
  console.error("❌ Gagal terhubung ke Keycloak. Pastikan server jalan.", err);
  document.getElementById('root').innerHTML = "<h1>Gagal terhubung ke server Login</h1>";
});