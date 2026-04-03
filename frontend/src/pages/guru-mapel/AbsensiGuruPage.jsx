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

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{summary.total}</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Hadir</p><p className="text-2xl font-bold">{summary.hadir}</p></div>
        <div className="bg-white border rounded-xl p-4"><p className="text-sm text-gray-500">Terlambat</p><p className="text-2xl font-bold">{summary.terlambat}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Guru</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.namaGuru} onChange={(e) => setForm({ ...form, namaGuru: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mata Pelajaran</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.mataPelajaran} onChange={(e) => setForm({ ...form, mataPelajaran: e.target.value })} placeholder="Contoh: Matematika" />
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
                  <td className="px-3 py-2 capitalize">{row.status}</td>
                  <td className="px-3 py-2">{row.keterangan || "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleQuickStatus(row, "hadir")} className="px-2 py-1 rounded bg-green-100 text-green-700">Hadir</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "izin")} className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">Izin</button>
                      <button type="button" onClick={() => handleQuickStatus(row, "sakit")} className="px-2 py-1 rounded bg-blue-100 text-blue-700">Sakit</button>
                      <button type="button" onClick={() => handleDelete(row)} className="px-2 py-1 rounded bg-red-100 text-red-700">Hapus</button>
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
