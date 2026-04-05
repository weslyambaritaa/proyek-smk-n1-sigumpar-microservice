import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { academicApi } from "../../api/academicApi";
import keycloak from "../../keycloak";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

const BASE_URL = import.meta.env.VITE_VOCATIONAL_URL || "";

function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  return `${BASE_URL}${foto_url}`;
}

export default function LokasiPKLPage() {
  const userId   = keycloak.tokenParsed?.sub || "";
  const namaSiswa = keycloak.tokenParsed?.name || "";

  // ── State Form ─────────────────────────────────────────────────────────
  const [kelasList,       setKelasList]       = useState([]);
  const [selectedKelas,   setSelectedKelas]   = useState("");
  const [namaSiswaInput,  setNamaSiswaInput]  = useState("");   // input manual nama siswa
  const [namaPerusahaan,  setNamaPerusahaan]  = useState("");
  const [alamat,          setAlamat]          = useState("");
  const [posisi,          setPosisi]          = useState("");
  const [deskripsi,       setDeskripsi]       = useState("");
  const [pembimbing,      setPembimbing]      = useState("");
  const [kontak,          setKontak]          = useState("");
  const [tanggal,         setTanggal]         = useState(new Date().toISOString().slice(0, 10));
  const [foto,            setFoto]            = useState(null);
  const [fotoPreview,     setFotoPreview]     = useState(null);
  const fileRef = useRef();

  // ── State Data ─────────────────────────────────────────────────────────
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);   // ← ImagePreviewModal
  const [previewFileName, setPreviewFileName] = useState("");

  // ── Load kelas & data ──────────────────────────────────────────────────
  useEffect(() => {
    academicApi.getAllKelas()
      .then(r => setKelasList(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(() => {});
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/vocational/pkl/lokasi");
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data lokasi PKL");
    } finally {
      setLoading(false);
    }
  };

  // ── Foto Handler (sama persis alur parenting) ──────────────────────────
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB");
      return;
    }
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Preview foto dari histori (sama seperti parenting) ─────────────────
  const handlePreviewFoto = (foto_url, nama) => {
    const full = getFullFotoUrl(foto_url);
    if (!full) return;
    setPreviewSrc(full);
    setPreviewFileName(nama || "Foto Lokasi PKL");
  };

  // ── Simpan / Update ────────────────────────────────────────────────────
  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!namaPerusahaan.trim()) { toast.error("Nama perusahaan wajib diisi"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("siswa_id",    userId);
      fd.append("nama_siswa",  namaSiswaInput.trim() || namaSiswa);
      fd.append("nama_perusahaan", namaPerusahaan);
      fd.append("alamat",      alamat);
      fd.append("posisi",      posisi);
      fd.append("deskripsi_pekerjaan", deskripsi);
      fd.append("pembimbing_industri", pembimbing);
      fd.append("kontak_pembimbing",   kontak);
      fd.append("tanggal",     tanggal);
      if (foto) fd.append("foto", foto);

      if (editId) {
        await axiosInstance.put(`/api/vocational/pkl/lokasi/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Data lokasi PKL berhasil diperbarui!");
        setEditId(null);
      } else {
        await axiosInstance.post("/api/vocational/pkl/lokasi", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lokasi PKL berhasil disimpan!");
      }

      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNamaSiswaInput(""); setNamaPerusahaan(""); setAlamat(""); setPosisi("");
    setDeskripsi(""); setPembimbing(""); setKontak("");
    setTanggal(new Date().toISOString().slice(0, 10));
    setFoto(null); setFotoPreview(null); setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setNamaSiswaInput(row.nama_siswa || "");
    setNamaPerusahaan(row.nama_perusahaan || "");
    setAlamat(row.alamat || "");
    setPosisi(row.posisi || "");
    setDeskripsi(row.deskripsi_pekerjaan || "");
    setPembimbing(row.pembimbing_industri || "");
    setKontak(row.kontak_pembimbing || "");
    setTanggal(row.tanggal || new Date().toISOString().slice(0, 10));
    setFoto(null);
    setFotoPreview(getFullFotoUrl(row.foto_url));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data lokasi PKL ini?")) return;
    try {
      await axiosInstance.delete(`/api/vocational/pkl/lokasi/${id}`);
      toast.success("Data berhasil dihapus");
      loadData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Image Preview Modal (alur sama seperti parenting) ── */}
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewFileName}
          onClose={() => { setPreviewSrc(null); setPreviewFileName(""); }}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">LOKASI PKL</h1>
        <p className="text-sm text-gray-500 mt-0.5">Catat dan dokumentasi lokasi Praktik Kerja Lapangan</p>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">

        {/* ── Form Input ── */}
        <form onSubmit={handleSimpan} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">🏭</div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
              {editId ? "Edit Data Lokasi PKL" : "Tambah Lokasi PKL"}
            </h2>
            {editId && (
              <button type="button" onClick={resetForm}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 font-semibold">
                ✕ Batal Edit
              </button>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Row 0: Nama Siswa */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={namaSiswaInput}
                onChange={e => setNamaSiswaInput(e.target.value)}
                placeholder="Ketik nama siswa yang PKL..."
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Nama Perusahaan / Instansi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={namaPerusahaan}
                  onChange={e => setNamaPerusahaan(e.target.value)}
                  placeholder="Contoh: PT. Maju Bersama"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Posisi / Bagian</label>
                <input
                  type="text" value={posisi} onChange={e => setPosisi(e.target.value)}
                  placeholder="Contoh: Teknisi, Admin, dll"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Alamat Perusahaan</label>
              <textarea
                value={alamat} onChange={e => setAlamat(e.target.value)} rows={2}
                placeholder="Alamat lengkap tempat PKL..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deskripsi Pekerjaan</label>
              <textarea
                value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={2}
                placeholder="Uraikan pekerjaan yang dilakukan..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Pembimbing Industri</label>
                <input
                  type="text" value={pembimbing} onChange={e => setPembimbing(e.target.value)}
                  placeholder="Nama pembimbing"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Kontak Pembimbing</label>
                <input
                  type="text" value={kontak} onChange={e => setKontak(e.target.value)}
                  placeholder="No. HP / Email"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tanggal Mulai PKL</label>
                <input
                  type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Foto Upload — alur persis seperti parenting */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Foto Lokasi PKL
              </label>
              {fotoPreview ? (
                <div className="relative inline-block">
                  {/* Thumbnail dapat diklik untuk preview fullscreen */}
                  <img
                    src={fotoPreview}
                    alt="Preview Foto PKL"
                    className="h-36 w-56 object-cover rounded-xl border-2 border-blue-200 shadow cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handlePreviewFoto(fotoPreview, "Preview Foto PKL")}
                    title="Klik untuk preview fullscreen"
                  />
                  <button
                    type="button" onClick={handleRemoveFoto}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow"
                  >✕</button>
                  <p className="text-xs text-blue-500 mt-1">🔍 Klik gambar untuk preview</p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-gray-50">
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-sm text-gray-500 font-medium">Klik untuk upload foto lokasi</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — maks 5MB</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              type="submit" disabled={saving}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {saving ? "Menyimpan..." : editId ? "💾 Update" : "💾 Simpan Lokasi PKL"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Batal
              </button>
            )}
          </div>
        </form>

        {/* ── Histori / Daftar Lokasi PKL ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Histori Lokasi PKL</h2>
            <button onClick={loadData} disabled={loading}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
              {loading ? "..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p>Memuat data...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">🏭</p>
              <p>Belum ada data lokasi PKL</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {rows.map((row, i) => (
                <div key={row.id} className="px-6 py-4 hover:bg-gray-50/70 flex items-start gap-4">
                  {/* Nomor */}
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>

                  {/* Foto thumbnail — klik untuk preview fullscreen seperti parenting */}
                  <div className="flex-shrink-0">
                    {row.foto_url ? (
                      <img
                        src={getFullFotoUrl(row.foto_url)}
                        alt="Foto Lokasi"
                        className="w-20 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:scale-105 transition-all shadow-sm"
                        onClick={() => handlePreviewFoto(row.foto_url, `Foto PKL — ${row.nama_perusahaan}`)}
                        title="Klik untuk preview foto"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 text-2xl">
                        🏭
                      </div>
                    )}
                    {row.foto_url && (
                      <button
                        onClick={() => handlePreviewFoto(row.foto_url, `Foto PKL — ${row.nama_perusahaan}`)}
                        className="w-full mt-1 text-[10px] text-blue-500 hover:text-blue-700 font-semibold text-center"
                      >
                        🔍 Preview
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{row.nama_perusahaan}</p>
                    {row.nama_siswa && (
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">
                        👤 {row.nama_siswa}
                      </p>
                    )}
                    {row.posisi && (
                      <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold mt-0.5">
                        {row.posisi}
                      </span>
                    )}
                    {row.alamat && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{row.alamat}</p>}
                    {row.pembimbing_industri && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        👤 {row.pembimbing_industri}
                        {row.kontak_pembimbing && ` · ${row.kontak_pembimbing}`}
                      </p>
                    )}
                    {row.deskripsi_pekerjaan && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{row.deskripsi_pekerjaan}</p>
                    )}
                  </div>

                  {/* Tanggal & Aksi */}
                  <div className="flex-shrink-0 text-right space-y-2">
                    <p className="text-xs text-gray-400">{row.tanggal || "-"}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(row)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}