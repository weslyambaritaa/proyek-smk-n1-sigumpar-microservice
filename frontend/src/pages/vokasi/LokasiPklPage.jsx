import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";
import keycloak from "../../keycloak";

// ── Modal Foto Fullscreen ──────────────────────────────────────────────────
function FotoModal({ url, siswa, perusahaan, onClose }) {
  if (!url) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-800 text-sm">📷 Foto Lokasi PKL</p>
            {siswa && <p className="text-xs text-gray-500">{siswa} — {perusahaan}</p>}
          </div>
          <div className="flex gap-2">
            <a
              href={url}
              download
              className="px-4 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold"
            >
              ⬇ Unduh
            </a>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold"
            >
              ↗ Tab Baru
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-semibold"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
        <div className="bg-gray-50 flex items-center justify-center p-4 min-h-[300px]">
          <img
            src={url}
            alt="Foto PKL"
            className="max-w-full max-h-[72vh] object-contain rounded-xl shadow"
          />
        </div>
      </div>
    </div>
  );
}

export default function LokasiPKLPage() {
  const namaGuru = keycloak.tokenParsed?.name || "Guru Vokasi";
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [modalFoto, setModalFoto] = useState(null); // { url, siswa, perusahaan }

  // Form state
  const [namaSiswa,          setNamaSiswa]          = useState("");
  const [namaPerusahaan,     setNamaPerusahaan]     = useState("");
  const [alamat,             setAlamat]             = useState("");
  const [tanggal,            setTanggal]            = useState(new Date().toISOString().slice(0, 10));
  const [posisi,             setPosisi]             = useState("");
  const [deskripsiPekerjaan, setDeskripsiPekerjaan] = useState("");
  const [pembimbing,         setPembimbing]         = useState("");
  const [kontakPembimbing,   setKontakPembimbing]   = useState("");
  const [foto,               setFoto]               = useState(null);
  const [fotoPreview,        setFotoPreview]        = useState(null);
  const fotoRef = useRef();

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAllLokasiPKL();
      setRows(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRows(); }, []);

  const resetForm = () => {
    setEditId(null); setNamaSiswa(""); setNamaPerusahaan(""); setAlamat("");
    setTanggal(new Date().toISOString().slice(0, 10));
    setPosisi(""); setDeskripsiPekerjaan(""); setPembimbing("");
    setKontakPembimbing(""); setFoto(null); setFotoPreview(null);
    if (fotoRef.current) fotoRef.current.value = "";
  };

  const openEdit = (row) => {
    setEditId(row.id); setNamaSiswa(row.nama_siswa || ""); setNamaPerusahaan(row.nama_perusahaan || "");
    setAlamat(row.alamat || ""); setTanggal(row.tanggal || new Date().toISOString().slice(0, 10));
    setPosisi(row.posisi || ""); setDeskripsiPekerjaan(row.deskripsi_pekerjaan || "");
    setPembimbing(row.pembimbing_industri || ""); setKontakPembimbing(row.kontak_pembimbing || "");
    setFotoPreview(row.foto_url || null); setFoto(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFoto(f);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) { toast.error("Nama perusahaan wajib diisi"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nama_siswa", namaSiswa);
      fd.append("nama_perusahaan", namaPerusahaan);
      fd.append("alamat", alamat);
      fd.append("tanggal", tanggal);
      fd.append("posisi", posisi);
      fd.append("deskripsi_pekerjaan", deskripsiPekerjaan);
      fd.append("pembimbing_industri", pembimbing);
      fd.append("kontak_pembimbing", kontakPembimbing);
      if (foto) fd.append("foto", foto);

      if (editId) {
        await vocationalApi.updateLokasiPKL(editId, fd);
        toast.success("Data PKL berhasil diperbarui!");
      } else {
        await vocationalApi.createLokasiPKL(fd);
        toast.success("Laporan PKL berhasil disimpan!");
      }
      resetForm();
      fetchRows(); // ← auto-refresh setelah simpan/update
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data lokasi PKL ini?")) return;
    try {
      await vocationalApi.deleteLokasiPKL(id);
      toast.success("Data berhasil dihapus");
      fetchRows();
    } catch { toast.error("Gagal menghapus data"); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Modal Foto Fullscreen */}
      <FotoModal
        url={modalFoto?.url}
        siswa={modalFoto?.siswa}
        perusahaan={modalFoto?.perusahaan}
        onClose={() => setModalFoto(null)}
      />

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">PELAPORAN DETAIL PENEMPATAN PKL</h1>
        <p className="text-sm text-blue-600 font-medium mt-0.5">Guru Vokasi: {namaGuru}</p>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">🏭</div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Informasi Lokasi & Pekerjaan</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nama Siswa</label>
                <input type="text" value={namaSiswa} onChange={(e) => setNamaSiswa(e.target.value)}
                  placeholder="Nama Siswa"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nama Perusahaan</label>
                <input type="text" value={namaPerusahaan} onChange={(e) => setNamaPerusahaan(e.target.value)}
                  placeholder="PT. ..." required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Alamat Singkat</label>
                <input type="text" value={alamat} onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Kota / Kab"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Judul Penempatan / Posisi</label>
                <input type="text" value={posisi} onChange={(e) => setPosisi(e.target.value)}
                  placeholder="Contoh: Teknisi Jaringan / Admin"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Utama Pekerjaan</label>
                <input type="text" value={deskripsiPekerjaan} onChange={(e) => setDeskripsiPekerjaan(e.target.value)}
                  placeholder="Tugas utama siswa..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pembimbing Industri</label>
                <input type="text" value={pembimbing} onChange={(e) => setPembimbing(e.target.value)}
                  placeholder="Nama Atasan"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kontak Pembimbing</label>
                <input type="text" value={kontakPembimbing} onChange={(e) => setKontakPembimbing(e.target.value)}
                  placeholder="WhatsApp"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Foto Lokasi <span className="text-gray-400 font-normal normal-case">(opsional)</span>
                </label>
                <input ref={fotoRef} type="file" accept="image/*" onChange={handleFotoChange}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
              </div>
              <div>
                <button type="submit" disabled={saving}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all">
                  {saving ? "..." : (editId ? "Update" : "Simpan Laporan")}
                </button>
                {editId && (
                  <button type="button" onClick={resetForm}
                    className="w-full mt-2 py-1.5 border border-gray-300 rounded-xl text-xs text-gray-500 hover:bg-gray-50">
                    Batal Edit
                  </button>
                )}
              </div>
            </div>

            {/* Preview foto form */}
            {fotoPreview && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                  onClick={() => setModalFoto({ url: fotoPreview, siswa: namaSiswa, perusahaan: namaPerusahaan })}
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Preview foto lokasi</p>
                  <button
                    type="button"
                    onClick={() => setModalFoto({ url: fotoPreview, siswa: namaSiswa, perusahaan: namaPerusahaan })}
                    className="text-xs text-blue-600 hover:underline mt-0.5"
                  >
                    Klik untuk perbesar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Tabel Arsip */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Daftar Penempatan & Tugas PKL</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{rows.length} data</span>
              <button
                onClick={fetchRows}
                disabled={loading}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                {loading ? "..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-7 h-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
              <p>Memuat data...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-5xl mb-3">📍</p>
              <p className="font-medium">Belum ada data lokasi PKL</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left w-8">No</th>
                  <th className="px-5 py-3 text-left w-20">Foto</th>
                  <th className="px-5 py-3 text-left">Siswa & Lokasi</th>
                  <th className="px-5 py-3 text-left">Judul & Deskripsi Tugas</th>
                  <th className="px-5 py-3 text-left">Pembimbing</th>
                  <th className="px-5 py-3 text-left">Tanggal</th>
                  <th className="px-5 py-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3">
                      {r.foto_url ? (
                        <div className="group relative">
                          {/* Thumbnail yang bisa diklik */}
                          <img
                            src={r.foto_url}
                            alt="Foto PKL"
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                            onClick={() => setModalFoto({ url: r.foto_url, siswa: r.nama_siswa, perusahaan: r.nama_perusahaan })}
                          />
                          {/* Label kecil di bawah thumbnail */}
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => setModalFoto({ url: r.foto_url, siswa: r.nama_siswa, perusahaan: r.nama_perusahaan })}
                              className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                              👁 Lihat
                            </button>
                            <span className="text-gray-300">|</span>
                            <a
                              href={r.foto_url}
                              download
                              className="text-xs text-green-600 font-semibold hover:underline"
                            >
                              ⬇
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-2xl">📷</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-800">{r.nama_siswa || "—"}</p>
                      <p className="text-blue-600 text-xs font-semibold mt-0.5">{r.nama_perusahaan}</p>
                      {r.alamat && <p className="text-gray-400 text-xs">{r.alamat}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800 text-xs uppercase">{r.posisi || "—"}</p>
                      <p className="text-gray-500 text-xs mt-0.5 max-w-xs">{r.deskripsi_pekerjaan || ""}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-800 text-xs">{r.pembimbing_industri || "—"}</p>
                      <p className="text-blue-600 text-xs">{r.kontak_pembimbing || ""}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.tanggal || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50"
                        >
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
      </div>
    </div>
  );
}
