/**
 * apiUtils.js — Utilitas untuk menangani response API secara aman
 *
 * Masalah umum: backend kadang mengembalikan { data: [...] } atau langsung [...],
 * atau bahkan null/undefined ketika terjadi error. Fungsi ini menangani semua kasus tersebut.
 */

/**
 * Ekstrak array dari response axios secara aman.
 * Mendukung format:
 *   - res.data = [ ... ]           → langsung array
 *   - res.data = { data: [ ... ] } → objek dengan key data
 *   - res.data = null/undefined    → fallback ke []
 *
 * @param {Object} res - Response dari axios
 * @returns {Array}
 */
export function extractArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}