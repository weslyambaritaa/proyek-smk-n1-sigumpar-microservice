import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const KelasDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    nama_kelas: "",
    tingkat: "",
    wali_kelas_id: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_kelas: initialData.nama_kelas || "",
        tingkat: initialData.tingkat || "",
        wali_kelas_id: initialData.wali_kelas_id || "",
      });
      setSearchQuery(initialData.nama_wali || "");
    } else {
      setFormData({ nama_kelas: "", tingkat: "", wali_kelas_id: "" });
      setSearchQuery("");
    }
  }, [initialData, isOpen]);

  // Auto-suggest Wali Kelas (Ketik 1 huruf langsung mencari)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0 && !formData.wali_kelas_id) {
        setIsSearching(true);
        try {
          const res = await academicApi.searchWaliKelas(searchQuery);
          setSuggestions(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, formData.wali_kelas_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savePromise = initialData?.id
      ? academicApi.updateKelas(initialData.id, formData)
      : academicApi.createKelas(formData);

    toast
      .promise(savePromise, {
        loading: "Menyimpan data...",
        success: "Data kelas berhasil disimpan!",
        error: "Gagal menyimpan data kelas.",
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => console.error(err));
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
            {initialData ? "Edit Kelas" : "Tambah Kelas"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Silakan isi data kelas pada form di bawah ini.
          </p>
        </div>

        {/* Body Form (Bisa di-scroll jika konten panjang) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="kelas-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.nama_kelas}
                onChange={(e) =>
                  setFormData({ ...formData, nama_kelas: e.target.value })
                }
                placeholder="Contoh: X RPL 1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tingkat <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.tingkat}
                onChange={(e) =>
                  setFormData({ ...formData, tingkat: e.target.value })
                }
              >
                <option value="" disabled>
                  Pilih Tingkat
                </option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Wali Kelas
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({ ...formData, wali_kelas_id: "" });
                }}
                placeholder="Ketik nama wali kelas..."
              />
              {isSearching && (
                <p className="text-xs text-gray-500 mt-1">Mencari...</p>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {suggestions.map((user) => (
                    <li
                      key={user.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, wali_kelas_id: user.id });
                        setSearchQuery(user.nama_lengkap);
                        setSuggestions([]);
                      }}
                    >
                      {user.nama_lengkap}
                    </li>
                  ))}
                </ul>
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
            form="kelas-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors min-w-24"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default KelasDialog;
