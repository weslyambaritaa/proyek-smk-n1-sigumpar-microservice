import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const JadwalDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    guru_id: "",
    kelas_id: "",
    mata_pelajaran: "",
    hari: "",
    waktu_mulai: "",
    waktu_berakhir: "",
  });

  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [searchMapel, setSearchMapel] = useState("");
  const [mapelSuggestions, setMapelSuggestions] = useState([]);

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

      academicApi
        .getAllMapel()
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setMapelList(data);
        })
        .catch((err) => {
          console.error("Gagal load mapel:", err);
          setMapelList([]);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        guru_id: initialData.guru_id || "",
        kelas_id: initialData.kelas_id || "",
        mata_pelajaran: initialData.mata_pelajaran || "",
        hari: initialData.hari || "",
        waktu_mulai: initialData.waktu_mulai || "",
        waktu_berakhir: initialData.waktu_berakhir || "",
      });
      setSearchQuery(initialData.nama_guru || "");
      setSearchMapel(initialData.mata_pelajaran || "");
    } else {
      setFormData({
        guru_id: "",
        kelas_id: "",
        mata_pelajaran: "",
        hari: "",
        waktu_mulai: "",
        waktu_berakhir: "",
      });
      setSearchQuery("");
      setSearchMapel("");
      setSuggestions([]);
      setMapelSuggestions([]);
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

  useEffect(() => {
    const safeMapelList = Array.isArray(mapelList) ? mapelList : [];

    if (searchMapel.length > 0 && !formData.mata_pelajaran) {
      const filtered = safeMapelList.filter((m) =>
        String(m.nama_mapel || "")
          .toLowerCase()
          .includes(searchMapel.toLowerCase())
      );
      setMapelSuggestions(filtered);
    } else {
      setMapelSuggestions([]);
    }
  }, [searchMapel, formData.mata_pelajaran, mapelList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSave = {
      ...formData,
      mata_pelajaran: formData.mata_pelajaran || searchMapel,
    };

    const savePromise = initialData?.id
      ? academicApi.updateJadwal(initialData.id, dataToSave)
      : academicApi.createJadwal(dataToSave);

    toast
      .promise(savePromise, {
        loading: "Menyimpan jadwal...",
        success: "Jadwal mengajar berhasil disimpan!",
        error: "Gagal menyimpan jadwal mengajar.",
      })
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((err) => console.error(err));
  };

  if (!isOpen) return null;

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const safeKelasList = Array.isArray(kelasList) ? kelasList : [];
  const safeMapelSuggestions = Array.isArray(mapelSuggestions)
    ? mapelSuggestions
    : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Jadwal Mengajar" : "Tambah Jadwal Mengajar"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Silakan isi detail jadwal pada form di bawah ini.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form id="jadwal-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Guru Pengajar <span className="text-red-500">*</span>
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
                        setFormData({ ...formData, guru_id: user.id });
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 bg-white"
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
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                value={searchMapel}
                onChange={(e) => {
                  setSearchMapel(e.target.value);
                  setFormData({ ...formData, mata_pelajaran: "" });
                }}
                placeholder="Ketik mata pelajaran"
              />

              {safeMapelSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {safeMapelSuggestions.map((m) => (
                    <li
                      key={m.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          mata_pelajaran: m.nama_mapel,
                        });
                        setSearchMapel(m.nama_mapel || "");
                        setMapelSuggestions([]);
                      }}
                    >
                      {m.nama_mapel || "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 bg-white"
                value={formData.hari}
                onChange={(e) =>
                  setFormData({ ...formData, hari: e.target.value })
                }
              >
                <option value="" disabled>
                  Pilih Hari
                </option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                  value={formData.waktu_mulai}
                  onChange={(e) =>
                    setFormData({ ...formData, waktu_mulai: e.target.value })
                  }
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Waktu Berakhir <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                  value={formData.waktu_berakhir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waktu_berakhir: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <button
            type="submit"
            form="jadwal-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors min-w-24"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default JadwalDialog;