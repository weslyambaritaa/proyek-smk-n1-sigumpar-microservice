import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";

const initialForm = {
  siswa_nama: "",
  perusahaan_nama: "",
  alamat_singkat: "",
  tanggal: new Date().toISOString().slice(0, 10),
  judul_penempatan: "",
  deskripsi_pekerjaan: "",
  pembimbing_industri: "",
  kontak_pembimbing: "",
};

export default function PKLPage() {
  const [form, setForm] = useState(initialForm);
  const [foto, setFoto] = useState(null);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await vocationalApi.getAllLokasiPKL();
      setRows(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data lokasi PKL");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (foto) fd.append("foto_lokasi", foto);

    try {
      setSaving(true);
      await vocationalApi.createLokasiPKL(fd);
      toast.success("Laporan berhasil disimpan");
      setForm(initialForm);
      setFoto(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menyimpan laporan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus laporan ini?")) return;
    try {
      await vocationalApi.deleteLokasiPKL(id);
      toast.success("Laporan berhasil dihapus");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus laporan");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f5f8] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 uppercase">
            Pelaporan Detail Penempatan PKL
          </h1>
          <p className="mt-2 text-sm tracking-[0.15em] uppercase text-slate-500 font-semibold">
            Guru Vokasi: Pelaporan Lokasi & Pekerjaan
          </p>
        </div>

        <div className="bg-white rounded-[28px] shadow-lg p-7 border border-slate-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
              📘
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">
              Informasi Lokasi & Pekerjaan
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Nama Siswa" name="siswa_nama" value={form.siswa_nama} onChange={handleChange} />
              <Input label="Nama Perusahaan" name="perusahaan_nama" value={form.perusahaan_nama} onChange={handleChange} />
              <Input label="Alamat Singkat" name="alamat_singkat" value={form.alamat_singkat} onChange={handleChange} />
              <Input label="Tanggal" type="date" name="tanggal" value={form.tanggal} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Judul Penempatan / Posisi" name="judul_penempatan" value={form.judul_penempatan} onChange={handleChange} />
              <Input label="Deskripsi Utama Pekerjaan" name="deskripsi_pekerjaan" value={form.deskripsi_pekerjaan} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Input label="Pembimbing Industri" name="pembimbing_industri" value={form.pembimbing_industri} onChange={handleChange} />
              <Input label="Kontak Pembimbing" name="kontak_pembimbing" value={form.kontak_pembimbing} onChange={handleChange} />
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">
                  Foto Lokasi
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="h-[52px] rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-wide hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Laporan"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[28px] shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-7 py-6 border-b border-slate-100">
            <h2 className="text-xl font-bold uppercase tracking-wide text-slate-800">
              Daftar Penempatan & Tugas PKL
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Siswa & Lokasi</th>
                  <th className="px-6 py-4">Judul & Deskripsi Tugas</th>
                  <th className="px-6 py-4">Pembimbing</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                      Belum ada data PKL.
                    </td>
                  </tr>
                ) : (
                  rows.map((item, i) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-6 py-5">{i + 1}</td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">{item.siswa_nama}</div>
                        <div className="text-sm text-blue-600 font-semibold">{item.perusahaan_nama}</div>
                        <div className="text-xs text-slate-400">{item.alamat_singkat}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">{item.judul_penempatan}</div>
                        <div className="text-sm text-slate-500">{item.deskripsi_pekerjaan}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">{item.pembimbing_industri}</div>
                        <div className="text-sm text-blue-600">{item.kontak_pembimbing}</div>
                      </td>
                      <td className="px-6 py-5 text-slate-500">{item.tanggal?.slice(0, 10)}</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full h-[52px] rounded-2xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
