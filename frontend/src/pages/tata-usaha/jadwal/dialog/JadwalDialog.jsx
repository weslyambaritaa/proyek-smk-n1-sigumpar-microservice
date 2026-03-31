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
  const [mapelList, setMapelList] = useState([]); // State untuk daftar mapel dari DB

  // --- State Auto-Suggest Guru ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- State Auto-Suggest Mapel ---
  const [searchMapel, setSearchMapel] = useState("");
  const [mapelSuggestions, setMapelSuggestions] = useState([]);

  // Ambil daftar kelas & mapel saat dialog dibuka
  useEffect(() => {
    if (isOpen) {
      academicApi.getAllKelas()
        .then((res) => setKelasList(Array.isArray(res.data) ? res.data : res.data.data || []))
        .catch(err => console.error("Gagal load kelas:", err));

      academicApi.getAllMapel()
        .then((res) => setMapelList(Array.isArray(res.data) ? res.data : res.data.data || []))
        .catch(err => console.error("Gagal load mapel:", err));
    }
  }, [isOpen]);

  // Set initial data untuk mode Edit
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
      setFormData({ guru_id: "", kelas_id: "", mata_pelajaran: "", hari: "", waktu_mulai: "", waktu_berakhir: "" });
      setSearchQuery("");
      setSearchMapel("");
    }
  }, [initialData, isOpen]);

  // Auto-suggest Guru Mengajar (Panggil API Auth)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0 && !formData.guru_id) {
        setIsSearching(true);
        try {
          const res = await academicApi.searchGuru(searchQuery);
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
  }, [searchQuery, formData.guru_id]);

  // Auto-suggest Mata Pelajaran (Filter Lokal dari mapelList DB)
  useEffect(() => {
    if (searchMapel.length > 0 && !formData.mata_pelajaran) {
      const filtered = mapelList.filter((m) =>
        m.nama_mapel.toLowerCase().includes(searchMapel.toLowerCase())
      );
      setMapelSuggestions(filtered);
    } else {
      setMapelSuggestions([]);
    }
  }, [searchMapel, formData.mata_pelajaran, mapelList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data final untuk dikirim
    const dataToSave = {
      ...formData,
      // Jika user mengetik manual tapi tidak klik sugesti, kita tetap simpan teksnya
      mata_pelajaran: formData.mata_pelajaran || searchMapel 
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
            
            {/* INPUT GURU (AUTO-SUGGEST API) */}
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
              {isSearching && <p className="text-xs text-gray-500 mt-1">Mencari...</p>}

              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {suggestions.map((user) => (
                    <li
                      key={user.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({ ...formData, guru_id: user.id });
                        setSearchQuery(user.nama_lengkap || user.username);
                        setSuggestions([]);
                      }}
                    >
                      {user.nama_lengkap || user.username}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* INPUT KELAS (DROPDOWN) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 bg-white"
                value={formData.kelas_id}
                onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
              >
                <option value="" disabled>Pilih Kelas</option>
                {kelasList.map(k => (
                    <option key={k.id} value={k.id}>{k.nama_kelas} - Tingkat {k.tingkat}</option>
                ))}
              </select>
            </div>

            {/* INPUT MAPEL (AUTO-SUGGEST LOKAL DATABASE) */}
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

              {mapelSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {mapelSuggestions.map((m) => (
                    <li
                      key={m.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      onClick={() => {
                        setFormData({ ...formData, mata_pelajaran: m.nama_mapel });
                        setSearchMapel(m.nama_mapel); // Ubah text input saat dipilih
                        setMapelSuggestions([]);      // Tutup dropdown sugesti
                      }}
                    >
                      {m.nama_mapel}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* INPUT HARI (DROPDOWN) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 bg-white"
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
              >
                <option value="" disabled>Pilih Hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>

            {/* INPUT WAKTU */}
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
                        onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, waktu_berakhir: e.target.value })}
                    />
                </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Batal</Button>
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