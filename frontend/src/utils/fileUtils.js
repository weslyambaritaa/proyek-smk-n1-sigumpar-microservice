/**
 * fileUtils.js — Utilitas untuk penanganan file di semua modul
 */

/**
 * Cek apakah URL mengarah ke file gambar berdasarkan ekstensi
 */
export const isImageUrl = (url) =>
  Boolean(url) && /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);

/**
 * Cek apakah URL mengarah ke file PDF
 */
export const isPdfUrl = (url) =>
  Boolean(url) && /\.pdf(\?.*)?$/i.test(url);

/**
 * Cek apakah URL mengarah ke file dokumen Word
 */
export const isDocUrl = (url) =>
  Boolean(url) && /\.(doc|docx)(\?.*)?$/i.test(url);

/**
 * Dapatkan ikon emoji berdasarkan tipe file
 */
export const getFileIcon = (url) => {
  if (!url) return "📎";
  if (isImageUrl(url)) return "🖼️";
  if (isPdfUrl(url))   return "📄";
  if (isDocUrl(url))   return "📝";
  return "📎";
};

/**
 * Ekstrak nama file dari URL
 */
export const getFileName = (url) => {
  if (!url) return "";
  return url.split("/").pop().split("?")[0];
};
