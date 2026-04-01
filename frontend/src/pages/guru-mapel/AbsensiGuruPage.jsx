import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import keycloak from "../../keycloak";
import Button from "../../components/ui/Button";
import {
  createAbsensiGuru,
  deleteAbsensiGuru,
  getAbsensiGuru,
  updateAbsensiGuru,
} from "../../api/learningApi";

export default function AbsensiGuruPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({
    namaGuru: keycloak.tokenParsed?.name || "",
    user_id: keycloak.tokenParsed?.sub || "",
    mataPelajaran: "",
    keterangan: "",
    status: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAbsensiGuru(filterTanggal ? { tanggal: filterTanggal } : {});
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat absensi guru");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterTanggal]);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      },
      { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 },
    );
  }, [rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.namaGuru || !form.user_id || !form.mataPelajaran) {
      toast.error("Nama guru, user ID, dan mata pelajaran wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await createAbsensiGuru(form);
      toast.success("Absensi guru berhasil disimpan");
      setForm((prev) => ({ ...prev, keterangan: "" }));
      loadData();
    } catch (err) {
      const message = err.response?.data?.message || "Gagal menyimpan absensi guru";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (row, status) => {
    try {
      await updateAbsensiGuru(row.id_absensiGuru, { status });
      toast.success("Status absensi diperbarui");
      loadData();
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus absensi ${row.namaGuru}?`)) return;
    try {
      await deleteAbsensiGuru(row.id_absensiGuru);
      toast.success("Absensi guru berhasil dihapus");
      loadData();
    } catch {
      toast.error("Gagal menghapus absensi guru");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Absensi Guru</h1>
        <p className="text-sm text-gray-500">Input absensi guru dan lihat rekap harian.</p>
      </div>

      <div className="grid md:grid-cols-6 gap-4">
        <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4"><p className="text-sm text-green-600">Hadir</p><p className="text-2xl font-bold text-green-700">{summary.hadir}</p></div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="text-sm text-yellow-600">Terlambat</p><p className="text-2xl font-bold text-yellow-700">{summary.terlambat}</p></div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm text-blue-600">Izin</p><p className="text-2xl font-bold text-blue-700">{summary.izin}</p></div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-sm text-orange-600">Sakit</p><p className="text-2xl font-bold text-orange-700">{summary.sakit}</p></div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-sm text-red-600">Alpa</p><p className="text-2xl font-bold text-red-700">{summary.alpa}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Guru</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50" value={form.namaGuru} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.mataPelajaran} onChange={(e) => setForm({ ...form, mataPelajaran: e.target.value })} placeholder="Contoh: Matematika" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status Kehadiran</label>
            <select className="w-full border rounded-lg px-3 py-2 bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="">-- Auto (Hadir/Terlambat) --</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpa">Alpa</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Biarkan kosong untuk deteksi otomatis berdasarkan jam masuk</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Filter</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keterangan</label>
          <textarea className="w-full border rounded-lg px-3 py-2" rows="3" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} placeholder="Catatan tambahan" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Absensi Guru"}</Button>
      </form>

      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Daftar Absensi</h2>
          <Button onClick={loadData} disabled={loading}>{loading ? "Memuat..." : "Refresh"}</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-2">Nama Guru</th>
                <th className="px-3 py-2">Mapel</th>
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2">Jam Masuk</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Keterangan</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-center text-gray-500" colSpan="7">Belum ada data absensi guru.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id_absensiGuru} className="border-b">
                  <td className="px-3 py-2">{row.namaGuru}</td>
                  <td className="px-3 py-2">{row.mataPelajaran}</td>
                  <td className="px-3 py-2">{row.tanggal}</td>
                  <td className="px-3 py-2">{new Date(row.jamMasuk).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-3 py-2 capitalize">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      row.status === 'hadir' ? 'bg-green-100 text-green-700' :
                      row.status === 'terlambat' ? 'bg-yellow-100 text-yellow-700' :
                      row.status === 'izin' ? 'bg-blue-100 text-blue-700' :
                      row.status === 'sakit' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>{row.status}</span>
                  </td>
                  <td className="px-3 py-2">{row.keterangan || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleQuickStatus(row, "hadir")} className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Hadir</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "terlambat")} className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Terlambat</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "izin")} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Izin</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "sakit")} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold">Sakit</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "alpa")} className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Alpa</button>
                      <button type="button" onClick={() => handleDelete(row)} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
