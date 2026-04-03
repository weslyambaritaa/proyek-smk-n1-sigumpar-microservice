import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import keycloak from './keycloak' // Import konfigurasi yang baru Anda buat

// Inisialisasi Keycloak
keycloak.init({ 
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
  flow: 'standard'
}).then((authenticated) => {
  if (authenticated) {
    
    console.log("✅ User terautentikasi");
    // window.keycloak = keycloak;
    
    // Render aplikasi hanya setelah login berhasil
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } else {
    // Jika gagal autentikasi, refresh halaman
    window.location.reload();
  }
}).catch((err) => {
  console.error("❌ Gagal inisialisasi Keycloak:", err);
  document.getElementById('root').innerHTML = `
    <div style="color: red; text-align: center; margin-top: 50px;">
      <h1>Gagal Terhubung ke Keycloak</h1>
      <p>Pastikan container Keycloak sudah jalan di http://localhost:8080</p>
    </div>
  `;
});