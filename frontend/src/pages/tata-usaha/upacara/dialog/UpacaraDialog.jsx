import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const UpacaraDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    tanggal: "",
    user_id: "",
    user_nama: "",
    tugas: "",
    keterangan: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      const date = initialData.tanggal
        ? new Date(initialData.tanggal).toISOString().split("T")[0]
        : "";

      setFormData({
        tanggal: date,
        user_id: initialData.user_id || "",
        user_nama: initialData.user_nama || "",
        tugas: initialData.tugas || initialData.petugas || "",
        keterangan: initialData.keterangan || "",
      });

      setSearchQuery(initialData.user_nama || "");
    } else {
      setFormData({
        tanggal: "",
        user_id: "",
        user_nama: "",
        tugas: "",
        keterangan: "",
      });
      setSearchQuery("");
    }

    setSuggestions([]);
  }, [initialData, isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 0 && !formData.user_id) {
        setIsSearching(true);

        try {
          const res = await academicApi.searchAllUsers(searchQuery);
          setSuggestions(res.data?.data || res.data || []);
        } catch (err) {
          console.error("Gagal mencari user:", err);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, formData.user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tanggal: formData.tanggal,
      user_id: formData.user_id || null,
      user_nama: formData.user_nama || null,
      tugas: formData.tugas || null,
      keterangan: formData.keterangan || null,
    };

    const savePromise = initialData?.id
      ? academicApi.updateUpacara(initialData.id, payload)
      : academicApi.createUpacara(payload);

    toast
      .promise(savePromise, {
        loading: "Menyimpan...",
        success: "Jadwal upacara disimpan!",
        error: "Gagal menyimpan.",
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => console.error(err));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit" : "Tambah"} Jadwal Upacara
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Pilih tanggal, petugas, dan tugas upacara.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="upacara-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Upacara <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Petugas Upacara <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({
                    ...formData,
                    user_id: "",
                    user_nama: "",
                  });
                }}
                placeholder="Cari nama user..."
              />

              {isSearching && (
                <p className="text-xs text-gray-500 mt-1">Mencari...</p>
              )}

              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {suggestions.map((u) => {
                    const nama = u.nama_lengkap || u.name || u.username;

                    return (
                      <li
                        key={u.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            user_id: u.id,
                            user_nama: nama,
                          });
                          setSearchQuery(nama);
                          setSuggestions([]);
                        }}
                      >
                        <div className="font-medium">{nama}</div>
                        {u.username && (
                          <div className="text-xs text-gray-500">
                            @{u.username}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {formData.user_id && formData.user_nama && (
                <p className="text-xs text-green-600 mt-2">
                  Petugas terpilih: {formData.user_nama}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tugas
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.tugas}
                onChange={(e) =>
                  setFormData({ ...formData, tugas: e.target.value })
                }
                placeholder="Contoh: Pembina, Pemimpin, MC, Doa"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                placeholder="Opsional"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <button
            type="submit"
            form="upacara-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpacaraDialog;
