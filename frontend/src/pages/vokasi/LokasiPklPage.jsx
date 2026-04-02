import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import { academicApi } from "../../api/academicApi";

export default function LokasiPKLPage() {
  const [rows,      setRows]      = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [isOpen,    setIsOpen]    = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({ siswa_id: "", nama_perusahaan: "", alamat: "" });

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllLokasiPKL();
      setRows(Array.isArray(res.data) ? res.data : []);
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
    setForm({ siswa_id: "", nama_perusahaan: "", alamat: "" });
    setIsOpen(true);
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({ siswa_id: row.siswa_id, nama_perusahaan: row.nama_perusahaan, alamat: row.alamat || "" });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.siswa_id || !form.nama_perusahaan)
      return toast.error("Siswa dan nama perusahaan wajib diisi");
    try {
      if (editId) {
        await vocationalApi.updateLokasiPKL(editId, form);
        toast.success("Lokasi PKL berhasil diperbarui!");
      } else {
        await vocationalApi.createLokasiPKL(form);
        toast.success("Lokasi PKL berhasil disimpan!");
      }
      setIsOpen(false);
      fetchRows();
    } catch { toast.error("Gagal menyimpan data"); }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus lokasi PKL siswa ini?`)) return;
    try {
      await vocationalApi.deleteLokasiPKL(row.id);
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
          <h1 className="text-2xl font-bold text-gray-800">Pelaporan Lokasi PKL</h1>
          <p className="text-sm text-gray-500 mt-1">Data tempat Praktik Kerja Lapangan siswa vokasi</p>
        </div>
        <button onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          + Tambah Lokasi PKL
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Daftar Lokasi PKL Siswa</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{rows.length} data</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Memuat data...</div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">📍</div>
            <p className="font-medium">Belum ada data lokasi PKL</p>
            <p className="text-sm mt-1">Tambahkan lokasi PKL menggunakan tombol di atas.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Nama Siswa</th>
                <th className="px-5 py-3 text-left">Perusahaan / Instansi</th>
                <th className="px-5 py-3 text-left">Alamat</th>
                <th className="px-5 py-3 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">{getSiswaName(r.siswa_id)}</td>
                  <td className="px-5 py-3 text-gray-700">{r.nama_perusahaan}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{r.alamat || "-"}</td>
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
                {editId ? "Edit Lokasi PKL" : "Tambah Lokasi PKL"}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Isi data lokasi PKL siswa</p>
            </div>
            <form id="lokasi-form" onSubmit={handleSubmit}
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
                  Nama Perusahaan / Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama_perusahaan}
                  onChange={(e) => setForm({ ...form, nama_perusahaan: e.target.value })}
                  required
                  placeholder="Contoh: PT. Telkom Indonesia"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Alamat</label>
                <textarea
                  rows={3}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Alamat lengkap perusahaan / instansi..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" />
              </div>
            </form>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                Batal
              </button>
              <button type="submit" form="lokasi-form"
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
