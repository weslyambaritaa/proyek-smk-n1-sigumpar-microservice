import { useEffect } from "react";

/**
 * Komponen Modal yang reusable
 * Menutup diri saat klik di luar modal atau tekan Escape
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Tambahkan keyboard listener untuk tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Nonaktifkan scroll pada body saat modal terbuka
      document.body.style.overflow = "hidden";
    }

    // Cleanup: hapus listener dan kembalikan scroll saat modal tutup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Overlay: latar belakang gelap semi-transparan
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose} // Klik overlay untuk menutup
    >
      {/* Modal content: stopPropagation agar klik di dalam tidak menutup */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;