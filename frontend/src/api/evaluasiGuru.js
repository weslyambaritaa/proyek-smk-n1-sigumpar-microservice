// src/api/evaluasiGuru.js
const API_BASE = "http://localhost:8001/api/learning";

const getToken = () => localStorage.getItem("token") || window.keycloak?.token;

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const fetchEvaluasiGuru = async (periode) => {
  const res = await fetch(
    `${API_BASE}/evaluasi/guru?periode=${encodeURIComponent(periode)}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal mengambil data");
  return json.data;
};

export const simpanEvaluasi = async (guruId, nilai, komentar, periode) => {
  const res = await fetch(`${API_BASE}/evaluasi/guru/${guruId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      nilai_numerik: nilai,
      komentar,
      periode_penilaian: periode,
    }),
  });
  const json = await res.json();
  if (!json.success)
    throw new Error(json.message || "Gagal menyimpan evaluasi");
  return json.data;
};
