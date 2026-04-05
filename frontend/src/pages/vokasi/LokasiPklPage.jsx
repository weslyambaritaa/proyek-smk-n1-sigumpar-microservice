import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { academicApi } from "../../api/academicApi";
import axiosInstance from "../../api/axiosInstance";
import keycloak from "../../keycloak";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";

function getFullFotoUrl(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  const base = axiosInstance.defaults.baseURL || "";
  return base ? `${base}${foto_url}` : foto_url;
}

export default function LokasiPKLPage() {
  const userId = keycloak.tokenParsed?.sub || "";
  const namaSiswaLogin = keycloak.tokenParsed?.name || "";

  const [kelasList, setKelasList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState("");
  const [namaSiswaInput, setNamaSiswaInput] = useState("");
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [posisi, setPosisi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [pembimbing, setPembimbing] = useState("");
  const [kontak, setKontak] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const [previewSrc, setPreviewSrc] = useState(null);
  const [previewName, setPreviewName] = useState("");

  const fileRef = useRef();

  const namaKelas =
    kelasList.find((k) => String(k.id) === String(selectedKelas))?.nama_kelas || "";

  useEffect(() => {
    academicApi
      .getAllKelas()
      .then((r) => {
        setKelasList(Array.isArray(r.data) ? r.data : r.data?.data || []);
      })
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
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

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

    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePreviewFoto = (url, nama) => {
    const full = getFullFotoUrl(url);
    if (!full) {
      toast.error("Foto tidak tersedia");
      return;
    }
    setPreviewSrc(full);
    setPreviewName(nama || "Foto Lokasi PKL");
  };

  const resetForm = () => {
    setEditId(null);
    setSelectedKelas("");
    setNamaSiswaInput("");
    setNamaPerusahaan("");
    setAlamat("");
    setPosisi("");
    setDeskripsi("");
    setPembimbing("");
    setKontak("");
    setTanggal(new Date().toISOString().slice(0, 10));
    setFoto(null);
    setFotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSimpan = async (e) => {
    e.preventDefault();

    if (!namaSiswaInput.trim() && !namaSiswaLogin.trim()) {
      toast.error("Nama siswa wajib diisi");
      return;
    }

    if (!namaPerusahaan.trim()) {
      toast.error("Nama perusahaan wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("siswa_id", userId);
      fd.append("kelas_id", selectedKelas || "");
      fd.append("nama_siswa", namaSiswaInput.trim() || namaSiswaLogin);
      fd.append("nama_perusahaan", namaPerusahaan);
      fd.append("alamat", alamat);
      fd.append("posisi", posisi);
      fd.append("deskripsi_pekerjaan", deskripsi);
      fd.append("pembimbing_industri", pembimbing);
      fd.append("kontak_pembimbing", kontak);
      fd.append("tanggal", tanggal);
      if (foto) fd.append("foto", foto);

      if (editId) {
        await axiosInstance.put(`/api/vocational/pkl/lokasi/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Data lokasi PKL berhasil diperbarui!");
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

  const handleEdit = (row) => {
    setEditId(row.id);
    setSelectedKelas(row.kelas_id ? String(row.kelas_id) : "");
    setNamaSiswaInput(row.nama_siswa || "");
    setNamaPerusahaan(row.nama_perusahaan || "");
    setAlamat(row.alamat || "");
    setPosisi(row.posisi || "");
    setDeskripsi(row.deskripsi_pekerjaan || "");
    setPembimbing(row.pembimbing_industri || "");
    setKontak(row.kontak_pembimbing || "");
    setTanggal(row.tanggal || new Date().toISOString().slice(0, 10));
    setFoto(null);
    setFotoPreview(row.foto_url || null);
    if (fileRef.current) fileRef.current.value = "";
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
      {previewSrc && (
        <ImagePreviewModal
          src={previewSrc}
          fileName={previewName}
          onClose={() => {
            setPreviewSrc(null);
            setPreviewName("");
          }}
        />
      )}

      <div className="bg-white border-b px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          LOKASI PKL
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Catat dan dokumentasi lokasi Praktik Kerja Lapangan
        </p>
        {(namaSiswaInput || namaSiswaLogin || namaKelas) && (
          <p className="text-sm text-blue-600 mt-1 font-medium">
            {namaSiswaInput || namaSiswaLogin}
            {namaKelas ? ` | ${namaKelas}` : ""}
          </p>
        )}
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        <form
          onSubmit={handleSimpan}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
              🏭
            </div>
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
              {editId ? "Edit Data Lokasi PKL" : "Tambah Lokasi PKL"}
            </h2>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 font-semibold"
              >
                ✕ Batal Edit
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Kelas
                    </label>
                    <select
                      value={selectedKelas}
                      onChange={(e) => setSelectedKelas(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Nama Siswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaSiswaInput}
                      onChange={(e) => setNamaSiswaInput(e.target.value)}
                      placeholder="Ketik nama siswa yang PKL..."
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Nama Perusahaan / Instansi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaPerusahaan}
                      onChange={(e) => setNamaPerusahaan(e.target.value)}
                      placeholder="Contoh: PT. Maju Bersama"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Posisi / Bagian
                    </label>
                    <input
                      type="text"
                      value={posisi}
                      onChange={(e) => setPosisi(e.target.value)}
                      placeholder="Contoh: Teknisi, Admin, dll"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Alamat Perusahaan
                  </label>
                  <textarea
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    rows={2}
                    placeholder="Alamat lengkap tempat PKL..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Deskripsi Pekerjaan
                  </label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows={3}
                    placeholder="Uraikan pekerjaan yang dilakukan..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Pembimbing Industri
                    </label>
                    <input
                      type="text"
                      value={pembimbing}
                      onChange={(e) => setPembimbing(e.target.value)}
                      placeholder="Nama pembimbing"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Kontak Pembimbing
                    </label>
                    <input
                      type="text"
                      value={kontak}
                      onChange={(e) => setKontak(e.target.value)}
                      placeholder="No. HP / Email"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Tanggal Mulai PKL
                    </label>
                    <input
                      type="date"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                >
                  {saving
                    ? "Menyimpan..."
                    : editId
                    ? "Update Lokasi PKL"
                    : "Simpan Lokasi PKL"}
                </button>
              </div>

              <div className="w-full md:w-56 flex flex-col gap-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Foto Lokasi PKL
                </label>

                <div
                  onClick={() => !fotoPreview && fileRef.current?.click()}
                  className={`flex-1 min-h-48 border-2 rounded-xl overflow-hidden transition-all ${
                    fotoPreview
                      ? "border-blue-300 cursor-default"
                      : "border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {fotoPreview ? (
                    <img
                      src={
                        fotoPreview.startsWith("data:")
                          ? fotoPreview
                          : getFullFotoUrl(fotoPreview)
                      }
                      alt="Preview Foto PKL"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        handlePreviewFoto(fotoPreview, "Preview Foto Lokasi PKL")
                      }
                      title="Klik untuk preview fullscreen"
                    />
                  ) : (
                    <>
                      <div className="text-4xl text-gray-300 mb-2">📷</div>
                      <p className="text-xs text-gray-400 text-center px-3">
                        Klik untuk upload foto lokasi
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />

                {fotoPreview && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePreviewFoto(fotoPreview, "Preview Foto Lokasi PKL")
                      }
                      className="flex-1 text-xs text-blue-500 hover:text-blue-700 font-semibold text-center py-1 border border-blue-200 rounded-lg transition-colors"
                    >
                      🔍 Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFoto}
                      className="flex-1 text-xs text-red-400 hover:text-red-600 font-semibold text-center py-1 border border-red-200 rounded-lg transition-colors"
                    >
                      ✕ Hapus
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                  JPG, PNG, WEBP
                  <br />
                  Maks 5MB
                </p>
              </div>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                Histori Lokasi PKL
              </h2>
              {!loading && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {rows.length} data ditemukan
                </p>
              )}
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">No</th>
                    <th className="px-4 py-3 text-left w-20">Foto</th>
                    <th className="px-4 py-3 text-left">Perusahaan / Instansi</th>
                    <th className="px-4 py-3 text-left">Siswa & Posisi</th>
                    <th className="px-4 py-3 text-left">Alamat</th>
                    <th className="px-4 py-3 text-left">Pembimbing</th>
                    <th className="px-4 py-3 text-left w-28">Tgl Mulai</th>
                    <th className="px-4 py-3 text-center w-32">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {row.foto_url ? (
                          <img
                            src={getFullFotoUrl(row.foto_url)}
                            alt="Foto Lokasi"
                            onClick={() =>
                              handlePreviewFoto(
                                row.foto_url,
                                `Foto PKL — ${row.nama_perusahaan || "Lokasi PKL"}`
                              )
                            }
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 hover:shadow-md transition-all"
                            title="Klik untuk lihat foto"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.innerHTML =
                                '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg" title="Foto tidak ditemukan">📷</div>';
                            }}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-lg"
                            title="Tidak ada foto"
                          >
                            📷
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800 text-sm">
                          {row.nama_perusahaan || "—"}
                        </p>
                        {row.deskripsi_pekerjaan && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 max-w-[180px]">
                            {row.deskripsi_pekerjaan}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {row.nama_siswa ? (
                          <p className="text-sm font-semibold text-gray-700">
                            👤 {row.nama_siswa}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">—</p>
                        )}

                        {row.posisi && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold mt-1">
                            {row.posisi}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500 max-w-[160px] line-clamp-2">
                          {row.alamat || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {row.pembimbing_industri ? (
                          <>
                            <p className="text-xs font-semibold text-gray-700">
                              {row.pembimbing_industri}
                            </p>
                            {row.kontak_pembimbing && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {row.kontak_pembimbing}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg font-medium">
                          {row.tanggal || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(row)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}