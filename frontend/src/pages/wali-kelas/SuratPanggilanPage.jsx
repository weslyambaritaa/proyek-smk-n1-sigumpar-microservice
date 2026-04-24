import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import keycloak from "../../keycloak";

export default function SuratPanggilanPage() {
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [histori, setHistori] = useState([]);
  const [form, setForm] = useState({
    siswa_id: "",
    nomor_surat: "",
    tanggal: new Date().toISOString().slice(0, 10),
    alasan: "",
    tindak_lanjut: "",
    status: "draft",
  });

  const waliId = keycloak.tokenParsed?.sub || "";

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) => setKelasList(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedKelas) return;
    academicApi
      .getAllSiswa({ kelas_id: selectedKelas })
      .then((r) => setSiswaList(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setSiswaList([]));
    loadHistori(selectedKelas);
  }, [selectedKelas]);

  const loadHistori = async (kelasId) => {
    try {
      const res = await academicApi.getSuratPanggilan({ kelas_id: kelasId });
      setHistori(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setHistori([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKelas) return toast.error("Pilih kelas terlebih dahulu");
    if (!form.siswa_id) return toast.error("Pilih siswa");
    if (!form.alasan.trim()) return toast.error("Alasan wajib diisi");

    try {
      await academicApi.createSuratPanggilan({
        ...form,
        kelas_id: selectedKelas,
        wali_id: waliId,
      });
      toast.success("Surat panggilan berhasil disimpan");
      setForm({
        siswa_id: "",
        nomor_surat: "",
        tanggal: new Date().toISOString().slice(0, 10),
        alasan: "",
        tindak_lanjut: "",
        status: "draft",
      });
      loadHistori(selectedKelas);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Gagal menyimpan surat panggilan",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus surat panggilan ini?")) return;
    try {
      await academicApi.deleteSuratPanggilan(id);
      toast.success("Berhasil dihapus");
      loadHistori(selectedKelas);
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800">
          SURAT PANGGILAN SISWA
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola surat panggilan siswa oleh wali kelas
        </p>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Pilih Kelas
          </label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
          >
            <option value="">-- Pilih Kelas --</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kelas}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Siswa
              </label>
              <select
                value={form.siswa_id}
                onChange={(e) => setForm({ ...form, siswa_id: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">-- Pilih Siswa --</option>
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nomor Surat
              </label>
              <input
                value={form.nomor_surat}
                onChange={(e) =>
                  setForm({ ...form, nomor_surat: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
                placeholder="Contoh: 001/WK/X/2026"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="dikirim">Dikirim</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Alasan Pemanggilan
            </label>
            <textarea
              rows={4}
              value={form.alasan}
              onChange={(e) => setForm({ ...form, alasan: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Tindak Lanjut
            </label>
            <textarea
              rows={3}
              value={form.tindak_lanjut}
              onChange={(e) =>
                setForm({ ...form, tindak_lanjut: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm">
              Simpan Surat Panggilan
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Riwayat Surat Panggilan</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Siswa</th>
                  <th className="px-4 py-3 text-left">Nomor Surat</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Alasan</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {histori.map((item, i) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">{item.tanggal}</td>
                    <td className="px-4 py-3 font-medium">
                      {item.nama_siswa || "-"}
                    </td>
                    <td className="px-4 py-3">{item.nomor_surat || "-"}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.alasan}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {histori.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      Belum ada surat panggilan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
