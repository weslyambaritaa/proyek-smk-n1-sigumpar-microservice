import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import { studentApi } from "../../api/studentApi";

export default function SuratPanggilanPage() {
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [alasan, setAlasan] = useState("");
  const [tindakLanjut, setTindakLanjut] = useState("");
  const [status, setStatus] = useState("draft");
  const [histori, setHistori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((res) => {
        setKelasList(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch(() => toast.error("Gagal memuat kelas"));
  }, []);

  useEffect(() => {
    if (!selectedKelas) {
      setSiswaList([]);
      setSelectedSiswa("");
      return;
    }

    academicApi
      .getAllSiswa({ kelas_id: selectedKelas })
      .then((res) => {
        setSiswaList(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch(() => {
        setSiswaList([]);
        toast.error("Gagal memuat siswa");
      });
  }, [selectedKelas]);

  const loadHistori = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedKelas) params.kelas_id = selectedKelas;
      if (selectedSiswa) params.siswa_id = selectedSiswa;

      const res = await studentApi.getSuratPanggilan(params);
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat surat panggilan:", err);
      setHistori([]);
      toast.error("Gagal memuat surat panggilan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistori();
  }, [selectedKelas, selectedSiswa]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedKelas) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }

    if (!selectedSiswa) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    if (!alasan.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await studentApi.createSuratPanggilan({
        kelas_id: selectedKelas,
        siswa_id: selectedSiswa,
        tanggal,
        alasan,
        tindak_lanjut: tindakLanjut,
        status,
      });

      toast.success("Surat panggilan berhasil disimpan");
      setAlasan("");
      setTindakLanjut("");
      setStatus("draft");
      await loadHistori();
    } catch (err) {
      console.error("Gagal menyimpan surat panggilan:", err);
      toast.error("Gagal menyimpan surat panggilan");
    } finally {
      setSaving(false);
    }
  };

  const getNamaSiswa = (id) =>
    siswaList.find((s) => String(s.id) === String(id))?.nama_lengkap ||
    `Siswa #${id}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 bg-blue-600 rounded-full" />
            <h1 className="text-xl font-bold text-gray-800">
              Surat Panggilan Siswa
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Catat surat panggilan siswa oleh wali kelas.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Siswa
              </label>
              <select
                value={selectedSiswa}
                onChange={(e) => setSelectedSiswa(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedKelas}
              >
                <option value="">-- Pilih Siswa --</option>
                {siswaList.map((siswa) => (
                  <option key={siswa.id} value={siswa.id}>
                    {siswa.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Alasan
            </label>
            <textarea
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Perlu pembinaan terkait kedisiplinan..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Tindak Lanjut
            </label>
            <textarea
              rows={3}
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Opsional"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="dikirim">Dikirim</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
              Riwayat Surat Panggilan
            </h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              Memuat data...
            </div>
          ) : histori.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              Belum ada surat panggilan
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {histori.map((item) => (
                <div
                  key={item.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-800">
                        {getNamaSiswa(item.siswa_id)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString("id-ID")
                          : "-"}{" "}
                        • {item.status || "draft"}
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold h-fit">
                      {item.status || "draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                    {item.alasan}
                  </p>
                  {item.tindak_lanjut && (
                    <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">
                      <span className="font-semibold">Tindak lanjut:</span>{" "}
                      {item.tindak_lanjut}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
