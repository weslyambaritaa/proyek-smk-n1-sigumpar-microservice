import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

export default function ProgresPKLPage() {
  const [rows,      setRows]      = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [isOpen,    setIsOpen]    = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({ siswa_id: "", minggu_ke: 1, deskripsi: "" });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllProgresPKL();
      setRows(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRows();
    academicApi.getAllSiswa()
      .then((r) => setSiswaList(Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ siswa_id: "", minggu_ke: 1, deskripsi: "" });
    setIsOpen(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({ siswa_id: row.siswa_id, minggu_ke: row.minggu_ke, deskripsi: row.deskripsi || "" });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.siswa_id) return toast.error("Pilih siswa terlebih dahulu");
    try {
      if (editId) {
        await vocationalApi.updateProgresPKL(editId, form);
        toast.success("Progres PKL berhasil diperbarui!");
      } else {
        await vocationalApi.createProgresPKL(form);
        toast.success("Progres PKL berhasil disimpan!");
      }
      setIsOpen(false);
      fetchRows();
    } catch { toast.error("Gagal menyimpan data"); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Hapus laporan progres ini?")) return;
    try {
      await vocationalApi.deleteProgresPKL(row.id);
      toast.success("Data berhasil dihapus");
      fetchRows();
    } catch { toast.error("Gagal menghapus data"); }
  };

  const getSiswaName = (id) => {
    const s = siswaList.find((x) => String(x.id) === String(id));
    return s ? s.nama_lengkap : `Siswa #${id}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pelaporan Progres PKL</h1>
          <p className="text-sm text-gray-500 mt-1">Laporan progres mingguan siswa Praktik Kerja Lapangan</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          + Tambah Progres
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Laporan Progres PKL</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{rows.length} laporan</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Memuat data...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">🏠</div>
            <p className="font-medium">Belum ada laporan progres PKL</p>
            <p className="text-sm mt-1">Tambahkan laporan mingguan siswa menggunakan tombol di atas.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Nama Siswa</th>
                <th className="px-5 py-3 text-center">Minggu Ke</th>
                <th className="px-5 py-3 text-left">Deskripsi Progres</th>
                <th className="px-5 py-3 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{getSiswaName(r.siswa_id)}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs font-bold">
                      Minggu {r.minggu_ke}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{r.deskripsi || "-"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(r)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(r)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full flex flex-col animate-slide-right shadow-2xl">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editId ? "Edit Laporan Progres PKL" : "Tambah Laporan Progres PKL"}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Isi data progres mingguan PKL siswa</p>
            </div>
            <form id="progres-form" onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.siswa_id}
                  onChange={(e) => setForm({ ...form, siswa_id: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
                  <option value="">-- Pilih Siswa --</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Minggu Ke <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min={1} max={24}
                  value={form.minggu_ke}
                  onChange={(e) => setForm({ ...form, minggu_ke: parseInt(e.target.value) || 1 })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                  Deskripsi Progres
                </label>
                <textarea
                  rows={5}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsikan kegiatan / progres yang dicapai minggu ini..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
              </div>
            </form>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                Batal
              </button>
              <button type="submit" form="progres-form"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
