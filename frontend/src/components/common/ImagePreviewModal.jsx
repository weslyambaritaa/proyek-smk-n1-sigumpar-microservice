import { useEffect } from "react";

/**
 * ImagePreviewModal — Komponen lightbox untuk menampilkan foto langsung di layar.
 * Digunakan oleh semua modul (Parenting, Kebersihan, Pramuka, PKL, dll)
 * agar gambar tidak langsung di-download saat diklik.
 *
 * Props:
 *   src      — URL gambar yang akan ditampilkan
 *   fileName — nama file untuk label (opsional)
 *   onClose  — callback saat modal ditutup
 */
export default function ImagePreviewModal({ src, fileName, onClose }) {
  // Tutup modal saat tekan Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-3">
          {fileName && (
            <span className="text-white text-sm font-medium truncate max-w-xs opacity-80">
              {fileName}
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <a
              href={src}
              download={fileName || "foto"}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              ⬇ Download
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              ✕ Tutup
            </button>
          </div>
        </div>

        {/* Gambar */}
        <img
          src={src}
          alt={fileName || "Preview"}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}
