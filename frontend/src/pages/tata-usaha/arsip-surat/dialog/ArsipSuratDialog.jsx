import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const ArsipSuratDialog = ({ isOpen, onClose, onRefresh, initialData }) => {
  const [nomorSurat, setNomorSurat] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNomorSurat(initialData.nomor_surat || "");
      setFile(null); // File tidak bisa di-set otomatis
    } else {
      setNomorSurat("");
      setFile(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!initialData && !file) {
      toast.error("Harap unggah file surat terlebih dahulu!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("nomor_surat", nomorSurat);
    if (file) {
      formData.append("file", file);
    }

    const savePromise = initialData?.id
      ? academicApi.updateArsipSurat(initialData.id, formData)
      : academicApi.createArsipSurat(formData);

    toast
      .promise(savePromise, {
        loading: "Menyimpan data...",
        success: "Arsip surat berhasil disimpan!",
        error: "Gagal menyimpan arsip surat.",
      })
      .then(() => {
        onRefresh();
        onClose();
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!isOpen) return null;

  return (
    // Background Overlay & Posisi Kanan (justify-end)
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      {/* Container Sheet (h-full, max-w-md, animasi dari kanan) */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Arsip Surat" : "Tambah Arsip Surat"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Silakan isi data arsip surat pada form di bawah ini.
          </p>
        </div>

        {/* Body Form (Bisa di-scroll jika konten panjang) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="arsip-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Contoh: 123/SMKN1/2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Unggah File Surat (PDF/DOCX/JPG)
                {!initialData && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 bg-white"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required={!initialData} // Input file wajib jika mode tambah
              />
              {initialData && !file && (
                <p className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                  *Biarkan kosong jika tidak ingin mengubah file surat saat ini.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer (Tombol Aksi) */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <button
            type="submit"
            form="arsip-form"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors min-w-24 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArsipSuratDialog;