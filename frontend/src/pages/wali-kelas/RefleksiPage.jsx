import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";

const REFLEKSI_TEMPLATE = [
  {
    id: "capaian",
    label: "Capaian Pembelajaran Minggu Ini",
    placeholder: "Apa yang berhasil dicapai siswa minggu ini?",
  },
  {
    id: "tantangan",
    label: "Tantangan yang Dihadapi",
    placeholder: "Apa kesulitan atau hambatan yang ditemui?",
  },
  {
    id: "rencana",
    label: "Rencana Tindak Lanjut",
    placeholder: "Apa langkah selanjutnya untuk meningkatkan pembelajaran?",
  },
];

export default function RefleksiPage() {
  const waliId = keycloak.tokenParsed?.sub;
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [minggu, setMinggu] = useState(new Date().toISOString().slice(0, 10));
  const [refleksi, setRefleksi] = useState({});
  const [saving, setSaving] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) =>
        setKelasList(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => {});
  }, []);

  const loadRiwayat = async () => {
    if (!selectedKelas) return;
    setLoadingRiwayat(true);
    try {
      const res = await studentApi.getRefleksi({ kelas_id: selectedKelas });
      setRiwayat(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setRiwayat([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    loadRiwayat();
  }, [selectedKelas]);

  const handleSimpan = async () => {
    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    const anyFilled = REFLEKSI_TEMPLATE.some((t) => refleksi[t.id]?.trim());
    if (!anyFilled) {
      toast.error("Isi minimal satu kolom refleksi");
      return;
    }

    setSaving(true);
    try {
      await studentApi.createRefleksi({
        kelas_id: selectedKelas,
        wali_id: waliId,
        tanggal: minggu,
        capaian: refleksi.capaian || "",
        tantangan: refleksi.tantangan || "",
        rencana: refleksi.rencana || "",
      });
      setRefleksi({});
      toast.success("Refleksi berhasil disimpan!");
      loadRiwayat();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan refleksi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          REFLEKSI
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Catatan refleksi pembelajaran mingguan wali kelas
        </p>
      </div>

      <div className="px-8 py-6 max-w-3xl mx-auto space-y-5">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tanggal Minggu Ini
              </label>
              <input
                type="date"
                value={minggu}
                onChange={(e) => setMinggu(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {REFLEKSI_TEMPLATE.map((t) => (
            <div key={t.id}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {t.label}
              </label>
              <textarea
                value={refleksi[t.id] || ""}
                onChange={(e) =>
                  setRefleksi((p) => ({ ...p, [t.id]: e.target.value }))
                }
                placeholder={t.placeholder}
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleSimpan}
              disabled={saving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
            >
              {saving ? "Menyimpan..." : "Simpan Refleksi"}
            </button>
          </div>
        </div>

        {/* Riwayat */}
        {selectedKelas && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Riwayat Refleksi
            </h3>
            {loadingRiwayat ? (
              <div className="py-8 text-center text-gray-400">Memuat...</div>
            ) : riwayat.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                Belum ada riwayat refleksi
              </div>
            ) : (
              <div className="space-y-3">
                {riwayat.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                  >
                    <p className="text-xs font-semibold text-blue-600 mb-2">
                      {r.tanggal}
                    </p>
                    {REFLEKSI_TEMPLATE.map(
                      (t) =>
                        r[t.id] && (
                          <p key={t.id} className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">{t.label}:</span>{" "}
                            {r[t.id]}
                          </p>
                        ),
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
