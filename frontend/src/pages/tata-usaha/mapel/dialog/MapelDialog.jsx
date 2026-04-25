import React, { useEffect, useState } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const MapelDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    nama_mapel: "",
    kelas_id: "",
    guru_mapel_id: "",
    guru_mapel_nama: "",
  });

  const [kelasOptions, setKelasOptions] = useState([]);
  const [guruQuery, setGuruQuery] = useState("");
  const [guruSuggestions, setGuruSuggestions] = useState([]);
  const [isSearchingGuru, setIsSearchingGuru] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    fetchKelas();

    if (initialData) {
      setFormData({
        nama_mapel: initialData.nama_mapel || "",
        kelas_id: initialData.kelas_id || "",
        guru_mapel_id: initialData.guru_mapel_id || "",
        guru_mapel_nama: initialData.guru_mapel_nama || "",
      });
      setGuruQuery(initialData.guru_mapel_nama || "");
    } else {
      setFormData({
        nama_mapel: "",
        kelas_id: "",
        guru_mapel_id: "",
        guru_mapel_nama: "",
      });
      setGuruQuery("");
    }

    setGuruSuggestions([]);
  }, [isOpen, initialData]);

  const fetchKelas = async () => {
    try {
      const res = await academicApi.getAllKelas();
      setKelasOptions(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil kelas:", err);
      setKelasOptions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (guruQuery.length > 0 && !formData.guru_mapel_id) {
        setIsSearchingGuru(true);

        try {
          const res = await academicApi.searchGuruMapel(guruQuery);
          setGuruSuggestions(res.data?.data || []);
        } catch (err) {
          console.error("Gagal mencari guru mapel:", err);
          setGuruSuggestions([]);
        } finally {
          setIsSearchingGuru(false);
        }
      } else {
        setGuruSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [guruQuery, formData.guru_mapel_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nama_mapel: formData.nama_mapel,
      kelas_id: formData.kelas_id || null,
      guru_mapel_id: formData.guru_mapel_id || null,
      guru_mapel_nama: formData.guru_mapel_nama || null,
    };

    const savePromise = initialData?.id
      ? academicApi.updateMapel(initialData.id, payload)
      : academicApi.createMapel(payload);

    toast
      .promise(savePromise, {
        loading: "Menyimpan mata pelajaran...",
        success: "Mata pelajaran berhasil disimpan!",
        error: "Gagal menyimpan mata pelajaran.",
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
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Isi nama mata pelajaran, kelas, dan guru mapel.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="mapel-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_mapel}
                onChange={(e) =>
                  setFormData({ ...formData, nama_mapel: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Contoh: Matematika"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kelas
              </label>
              <select
                value={formData.kelas_id}
                onChange={(e) =>
                  setFormData({ ...formData, kelas_id: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
              >
                <option value="">Pilih kelas</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.tingkat} - {kelas.nama_kelas}
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
                value={guruQuery}
                onChange={(e) => {
                  setGuruQuery(e.target.value);
                  setFormData({
                    ...formData,
                    guru_mapel_id: "",
                    guru_mapel_nama: "",
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Ketik nama guru mapel..."
              />

              {isSearchingGuru && (
                <p className="text-xs text-gray-500 mt-1">Mencari...</p>
              )}

              {guruSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {guruSuggestions.map((user) => (
                    <li
                      key={user.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          guru_mapel_id: user.id,
                          guru_mapel_nama: user.nama_lengkap,
                        });
                        setGuruQuery(user.nama_lengkap);
                        setGuruSuggestions([]);
                      }}
                    >
                      <div className="font-medium text-sm">
                        {user.nama_lengkap}
                      </div>
                      {user.username && (
                        <div className="text-xs text-gray-500">
                          @{user.username}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {formData.guru_mapel_id && formData.guru_mapel_nama && (
                <p className="text-xs text-green-600 mt-2">
                  Guru mapel terpilih: {formData.guru_mapel_nama}
                </p>
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
