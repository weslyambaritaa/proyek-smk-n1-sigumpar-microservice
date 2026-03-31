import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { vocationApi } from "../../api/vocationApi";

const EMPTY_FORM = {
  nama_siswa: "",
  nama_perusahaan: "",
  alamat_singkat: "",
  tanggal: "",
  judul_penempatan: "",
  deskripsi_pekerjaan: "",
  pembimbing_industri: "",
  kontak_pembimbing: "",
};

const PelaporanLokasiPage = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [fotoFile, setFotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await vocationApi.getPenempatan();
      const rows = res.data?.data ?? res.data ?? [];
      setData(Array.isArray(rows) ? rows : []);
    } catch {
      toast.error("Gagal memuat data penempatan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fotoFile) fd.append("foto_lokasi", fotoFile);

    setSubmitting(true);
    const promise = vocationApi.createPenempatan(fd);
    toast.promise(promise, {
      loading: "Menyimpan laporan...",
      success: "Laporan penempatan berhasil disimpan!",
      error:   "Gagal menyimpan laporan.",
    }).then(() => {
      setForm(EMPTY_FORM);
      setFotoFile(null);
      if (fileRef.current) fileRef.current.value = "";
      loadData();
    }).finally(() => setSubmitting(false));
  };

  const fotoUrl = (filename) =>
    filename ? `${import.meta.env.VITE_API_URL || "http://localhost:8001"}/api/pkl/uploads/${filename}` : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Pelaporan Lokasi PKL</h1>

      {/* === FORM CARD === */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Tambah Laporan Penempatan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Siswa</label>
              <input name="nama_siswa" value={form.nama_siswa} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Perusahaan</label>
              <input name="nama_perusahaan" value={form.nama_perusahaan} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Alamat Singkat</label>
              <input name="alamat_singkat" value={form.alamat_singkat} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
              <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Judul Penempatan</label>
              <input name="judul_penempatan" value={form.judul_penempatan} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pembimbing Industri</label>
              <input name="pembimbing_industri" value={form.pembimbing_industri} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kontak Pembimbing</label>
              <input name="kontak_pembimbing" value={form.kontak_pembimbing} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Foto Lokasi</label>
              <input ref={fileRef} type="file" accept="image/*"
                onChange={(e) => setFotoFile(e.target.files[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi Pekerjaan</label>
            <textarea name="deskripsi_pekerjaan" value={form.deskripsi_pekerjaan} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              Simpan Laporan
            </button>
          </div>
        </form>
      </div>

      {/* === TABLE CARD === */}
      <div className="bg-white rounded-xl shadow overflow-visible">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Daftar Penempatan PKL</h2>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-400">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 w-10">No</th>
                  <th className="px-4 py-3 w-20">Foto</th>
                  <th className="px-4 py-3">Siswa &amp; Lokasi</th>
                  <th className="px-4 py-3">Judul &amp; Deskripsi</th>
                  <th className="px-4 py-3">Pembimbing</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      Belum ada laporan penempatan.
                    </td>
                  </tr>
                )}
                {data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {fotoUrl(row.foto_lokasi) ? (
                        <img src={`http://localhost:8001/api/pkl/uploads/${row.foto_lokasi}`} alt="foto" className="w-14 h-14 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">—</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm text-gray-800">{row.nama_siswa}</p>
                      <p className="text-xs text-gray-500">{row.nama_perusahaan}</p>
                      <p className="text-xs text-gray-400">{row.alamat_singkat}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-sm text-gray-700">{row.judul_penempatan}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{row.deskripsi_pekerjaan}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{row.pembimbing_industri}</p>
                      <p className="text-xs text-gray-500">{row.kontak_pembimbing}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {row.tanggal ? new Date(row.tanggal).toLocaleDateString("id-ID") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PelaporanLokasiPage;
