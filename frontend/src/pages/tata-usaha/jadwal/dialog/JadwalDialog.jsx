import React, { useEffect, useState } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import toast from "react-hot-toast";

const JadwalDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    guru_id: "",
    guru_nama: "",
    kelas_id: "",
    mapel_id: "",
    mata_pelajaran: "",
    hari: "",
    waktu_mulai: "",
    waktu_berakhir: "",
  });

  const [guruQuery, setGuruQuery] = useState("");
  const [guruSuggestions, setGuruSuggestions] = useState([]);
  const [isSearchingGuru, setIsSearchingGuru] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        guru_id: initialData.guru_id || "",
        guru_nama: initialData.guru_nama || "",
        kelas_id: initialData.kelas_id || "",
        mapel_id: initialData.mapel_id || "",
        mata_pelajaran:
          initialData.mata_pelajaran || initialData.nama_mapel || "",
        hari: initialData.hari || "",
        waktu_mulai: initialData.waktu_mulai || "",
        waktu_berakhir: initialData.waktu_berakhir || "",
      });

      setGuruQuery(initialData.guru_nama || "");

      if (initialData.guru_id) {
        fetchAssignmentsByGuru(initialData.guru_id);
      }
    } else {
      setFormData({
        guru_id: "",
        guru_nama: "",
        kelas_id: "",
        mapel_id: "",
        mata_pelajaran: "",
        hari: "",
        waktu_mulai: "",
        waktu_berakhir: "",
      });

      setGuruQuery("");
      setAssignments([]);
    }

    setGuruSuggestions([]);
  }, [isOpen, initialData]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (guruQuery.length > 0 && !formData.guru_id) {
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
  }, [guruQuery, formData.guru_id]);

  const fetchAssignmentsByGuru = async (guruId) => {
    try {
      setIsLoadingAssignments(true);
      const res = await academicApi.getMapelByGuru(guruId);
      setAssignments(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil assignment guru mapel:", err);
      setAssignments([]);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleSelectGuru = async (guru) => {
    setFormData((prev) => ({
      ...prev,
      guru_id: guru.id,
      guru_nama: guru.nama_lengkap,
      kelas_id: "",
      mapel_id: "",
      mata_pelajaran: "",
    }));

    setGuruQuery(guru.nama_lengkap);
    setGuruSuggestions([]);

    await fetchAssignmentsByGuru(guru.id);
  };

  const handleSelectAssignment = (assignmentId) => {
    const selected = assignments.find(
      (item) => String(item.mapel_id) === String(assignmentId),
    );

    if (!selected) {
      setFormData((prev) => ({
        ...prev,
        kelas_id: "",
        mapel_id: "",
        mata_pelajaran: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      kelas_id: selected.kelas_id,
      mapel_id: selected.mapel_id,
      mata_pelajaran: selected.nama_mapel,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      guru_id: formData.guru_id || null,
      guru_nama: formData.guru_nama || null,
      kelas_id: formData.kelas_id || null,
      mapel_id: formData.mapel_id || null,
      mata_pelajaran: formData.mata_pelajaran || null,
      hari: formData.hari,
      waktu_mulai: formData.waktu_mulai || null,
      waktu_berakhir: formData.waktu_berakhir || null,
    };

    const savePromise = initialData?.id
      ? academicApi.updateJadwal(initialData.id, payload)
      : academicApi.createJadwal(payload);

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
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Jadwal Mengajar" : "Tambah Jadwal Mengajar"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Pilih guru mapel, lalu pilih mapel dan kelas yang sudah di-assign.
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
                value={guruQuery}
                onChange={(e) => {
                  setGuruQuery(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    guru_id: "",
                    guru_nama: "",
                    kelas_id: "",
                    mapel_id: "",
                    mata_pelajaran: "",
                  }));
                  setAssignments([]);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                placeholder="Ketik nama guru mapel..."
              />

              {isSearchingGuru && (
                <p className="text-xs text-gray-500 mt-1">Mencari guru...</p>
              )}

              {guruSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
                  {guruSuggestions.map((guru) => (
                    <li
                      key={guru.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleSelectGuru(guru)}
                    >
                      <div className="font-medium text-sm">
                        {guru.nama_lengkap}
                      </div>
                      {guru.username && (
                        <div className="text-xs text-gray-500">
                          @{guru.username}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {formData.guru_id && (
                <p className="text-xs text-green-600 mt-2">
                  Guru terpilih: {formData.guru_nama}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mata Pelajaran & Kelas <span className="text-red-500">*</span>
              </label>

              <select
                required
                disabled={!formData.guru_id || isLoadingAssignments}
                value={formData.mapel_id}
                onChange={(e) => handleSelectAssignment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">
                  {!formData.guru_id
                    ? "Pilih guru terlebih dahulu"
                    : isLoadingAssignments
                      ? "Memuat assignment..."
                      : "Pilih mapel dan kelas"}
                </option>

                {assignments.map((item) => (
                  <option key={item.mapel_id} value={item.mapel_id}>
                    {item.nama_mapel} - {item.tingkat} {item.nama_kelas}
                  </option>
                ))}
              </select>

              {formData.guru_id &&
                !isLoadingAssignments &&
                assignments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Guru ini belum di-assign ke mata pelajaran dan kelas mana
                    pun.
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.hari}
                onChange={(e) =>
                  setFormData({ ...formData, hari: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
              >
                <option value="">Pilih hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mulai
                </label>
                <input
                  type="time"
                  value={formData.waktu_mulai}
                  onChange={(e) =>
                    setFormData({ ...formData, waktu_mulai: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Selesai
                </label>
                <input
                  type="time"
                  value={formData.waktu_berakhir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      waktu_berakhir: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
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
