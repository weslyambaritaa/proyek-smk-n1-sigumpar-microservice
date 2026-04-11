import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const MapelDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    nama_mapel: "",
    kelas_id: "",
    guru_mapel_id: "",
  });

  const [kelasList, setKelasList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      academicApi
        .getAllKelas()
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setKelasList(data);
        })
        .catch((err) => {
          console.error("Gagal load kelas:", err);
          setKelasList([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_mapel: initialData.nama_mapel || "",
        kelas_id: initialData.kelas_id || "",
        guru_mapel_id: initialData.guru_mapel_id || "",
      });
      setSearchQuery(initialData.nama_guru || "");
    } else {
      setFormData({
        nama_mapel: "",
        kelas_id: "",
        guru_mapel_id: "",
      });
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0 && !formData.guru_mapel_id) {
        setIsSearching(true);
        try {
          const res = await academicApi.searchGuru(searchQuery);
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setSuggestions(data);
        } catch (err) {
          console.error(err);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, formData.guru_mapel_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const savePromise = initialData?.id
      ? academicApi.updateMapel(initialData.id, formData)
      : academicApi.createMapel(formData);

    toast
      .promise(savePromise, {
        loading: "Menyimpan data...",
        success: "Data mapel berhasil disimpan!",
        error: "Gagal menyimpan data mapel.",
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => console.error(err));
  };

  if (!isOpen) return null;

  const safeKelasList = Array.isArray(kelasList) ? kelasList : [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Silakan isi detail mata pelajaran pada form di bawah ini.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="mapel-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Mapel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.nama_mapel}
                onChange={(e) =>
                  setFormData({ ...formData, nama_mapel: e.target.value })
                }
                placeholder="Contoh: Matematika Lanjut"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.kelas_id}
                onChange={(e) =>
                  setFormData({ ...formData, kelas_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Pilih Kelas
                </option>
                {safeKelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas} - Tingkat {k.tingkat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Guru Mapel
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({ ...formData, guru_mapel_id: "" });
                }}
                placeholder="Ketik nama guru..."
              />
              {isSearching && (
                <p className="text-xs text-gray-500 mt-1">Mencari...</p>
              )}

              {safeSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {safeSuggestions.map((user) => (
                    <li
                      key={user.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({ ...formData, guru_mapel_id: user.id });
                        setSearchQuery(user.nama_lengkap || user.username || "");
                        setSuggestions([]);
                      }}
                    >
                      {user.nama_lengkap || user.username || "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <button
            type="submit"
            form="mapel-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors min-w-24"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapelDialog;