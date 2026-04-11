import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const PiketDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({ tanggal: "", guru_id: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialData) {
      const date = new Date(initialData.tanggal).toISOString().split("T")[0];
      setFormData({ tanggal: date, guru_id: initialData.guru_id || "" });
      setSearchQuery(initialData.nama_guru || "");
    } else {
      setFormData({ tanggal: "", guru_id: "" });
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0 && !formData.guru_id) {
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
  }, [searchQuery, formData.guru_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const savePromise = initialData?.id
      ? academicApi.updatePiket(initialData.id, formData)
      : academicApi.createPiket(formData);

    toast.promise(savePromise, {
      loading: "Menyimpan...",
      success: "Jadwal piket disimpan!",
      error: "Gagal menyimpan.",
    }).then(() => {
      onSuccess();
      onClose();
    });
  };

  if (!isOpen) return null;

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit" : "Tambah"} Jadwal Piket
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="piket-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tanggal Piket <span className="text-red-500">*</span>
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
                Guru Piket <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({ ...formData, guru_id: "" });
                }}
                placeholder="Cari nama guru..."
              />

              {isSearching && (
                <p className="text-xs text-gray-500 mt-1">Mencari...</p>
              )}

              {safeSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {safeSuggestions.map((u) => (
                    <li
                      key={u.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({ ...formData, guru_id: u.id });
                        setSearchQuery(u.nama_lengkap || u.username || "");
                        setSuggestions([]);
                      }}
                    >
                      {u.nama_lengkap || u.username || "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <button
            type="submit"
            form="piket-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PiketDialog;