/**
 * api.js — Centralized API helper untuk Vocational Service
 * Semua komponen FE mengimport dari sini agar URL API terpusat.
 */

const BASE_URL =
  import.meta.env.VITE_VOCATIONAL_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3004/api/vocational`
    : "http://localhost:3004/api/vocational");

/**
 * Wrapper fetch yang otomatis menyertakan JWT token dari localStorage/session
 */
async function apiFetch(endpoint, options = {}) {
  const token =
    localStorage.getItem("access_token") ||
    document.cookie.match(/token=([^;]+)/)?.[1];

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── PKL ────────────────────────────────────────────────────────
export const getAllPKL = (nama = "") =>
  apiFetch(`/pkl${nama ? `?nama=${encodeURIComponent(nama)}` : ""}`);

export const validatePKL = (id, body) =>
  apiFetch(`/pkl/validate/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

// ── MONITORING ─────────────────────────────────────────────────
export const getAllMonitoring = (submissionId) =>
  apiFetch(
    `/pkl/monitoring${submissionId ? `?submission_id=${submissionId}` : ""}`,
  );

export const createMonitoring = (formData) =>
  fetch(`${BASE_URL}/pkl/monitoring`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
    body: formData, // FormData untuk file upload
  }).then((r) => r.json());

// ── PENILAIAN ──────────────────────────────────────────────────
export const getPenilaianStats = () => apiFetch("/penilaian/stats");

export const getPenilaianById = (submissionId) =>
  apiFetch(`/penilaian/${submissionId}`);

export const upsertPenilaian = (body) =>
  apiFetch("/penilaian/upsert", {
    method: "POST",
    body: JSON.stringify(body),
  });
