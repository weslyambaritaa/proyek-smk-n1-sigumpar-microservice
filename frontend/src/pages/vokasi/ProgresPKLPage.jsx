import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { vocationalApi } from "../../api/vocationalApi";

export default function ProgresPKLPage() {
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [progresList, setProgresList] = useState([]);

  const [kelasId, setKelasId] = useState("");
  const [siswaId, setSiswaId] = useState("");
  const [mingguKe, setMingguKe] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingSiswa, setLoadingSiswa] = useState(false);
  const [loadingProgres, setLoadingProgres] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedSiswa = siswaList.find(
    (item) => String(item.id) === String(siswaId),
  );

  const filteredProgres = useMemo(() => {
    if (!siswaId) return progresList;

    return progresList.filter(
      (item) => String(item.siswa_id) === String(siswaId),
    );
  }, [progresList, siswaId]);

  const loadKelas = async () => {
    setLoadingKelas(true);

    try {
      const res = await vocationalApi.getKelasVokasi();
      setKelasList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
      toast.error("Gagal memuat daftar kelas");
    } finally {
      setLoadingKelas(false);
    }
  };

  const loadSiswa = async (selectedKelasId) => {
    if (!selectedKelasId) {
      setSiswaList([]);
      setSiswaId("");
      return;
    }

    setLoadingSiswa(true);

    try {
      const res = await vocationalApi.getSiswaVokasi({
        kelas_id: selectedKelasId,
      });

      setSiswaList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat siswa:", err);
      toast.error("Gagal memuat daftar siswa");
      setSiswaList([]);
    } finally {
      setLoadingSiswa(false);
    }
  };

  const loadProgres = async () => {
    setLoadingProgres(true);

    try {
      const res = await vocationalApi.getAllProgresPKL();
      setProgresList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Gagal memuat progres PKL:", err);
      toast.error("Gagal memuat progres PKL");
    } finally {
      setLoadingProgres(false);
    }
  };

  useEffect(() => {
    loadKelas();
    loadProgres();
  }, []);

  useEffect(() => {
    loadSiswa(kelasId);
  }, [kelasId]);

  const resetForm = () => {
    setSiswaId("");
    setMingguKe("");
    setDeskripsi("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!siswaId) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    if (!mingguKe) {
      toast.error("Minggu ke wajib diisi");
      return;
    }

    const payload = {
      siswa_id: Number(siswaId),
      kelas_id: kelasId ? Number(kelasId) : null,
      nama_siswa:
        selectedSiswa?.nama_lengkap || selectedSiswa?.nama_siswa || "",
      nisn: selectedSiswa?.nisn || "",
      minggu_ke: Number(mingguKe),
      deskripsi: deskripsi || "",
    };

    setSaving(true);

    try {
      if (editingId) {
        await vocationalApi.updateProgresPKL(editingId, payload);
        toast.success("Progres PKL berhasil diperbarui");
      } else {
        await vocationalApi.createProgresPKL(payload);
        toast.success("Progres PKL berhasil disimpan");
      }

      resetForm();
      await loadProgres();
    } catch (err) {
      console.error("Gagal menyimpan progres PKL:", err);
      toast.error(err?.response?.data?.error || "Gagal menyimpan progres PKL");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSiswaId(String(item.siswa_id || ""));
    setMingguKe(String(item.minggu_ke || ""));
    setDeskripsi(item.deskripsi || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus progres PKL ini?")) return;

    try {
      await vocationalApi.deleteProgresPKL(id);
      toast.success("Progres PKL berhasil dihapus");
      await loadProgres();
    } catch (err) {
      console.error("Gagal menghapus progres PKL:", err);
      toast.error(err?.response?.data?.error || "Gagal menghapus progres PKL");
    }
  };

  const getNamaSiswa = (item) => {
    const siswa = siswaList.find((s) => String(s.id) === String(item.siswa_id));

    return (
      siswa?.nama_lengkap || siswa?.nama_siswa || `Siswa ID: ${item.siswa_id}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-blue-600 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Progres PKL</h1>
            <p className="text-sm text-gray-500">
              Kelola laporan progres mingguan siswa PKL.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-5 max-w-6xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">
            {editingId ? "Edit Progres PKL" : "Tambah Progres PKL"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Kelas
                </label>
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  disabled={loadingKelas}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingKelas ? "Memuat kelas..." : "-- Pilih Kelas --"}
                  </option>

                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Siswa
                </label>
                <select
                  value={siswaId}
                  onChange={(e) => setSiswaId(e.target.value)}
                  disabled={!kelasId || loadingSiswa}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {loadingSiswa ? "Memuat siswa..." : "-- Pilih Siswa --"}
                  </option>

                  {siswaList.map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.nama_lengkap || siswa.nama_siswa || "-"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  Minggu Ke
                </label>
                <input
                  type="number"
                  min="1"
                  value={mingguKe}
                  onChange={(e) => setMingguKe(e.target.value)}
                  placeholder="Contoh: 1"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Deskripsi Progres
              </label>
              <textarea
                rows={4}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan aktivitas/progres siswa selama minggu ini..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {selectedSiswa && (
              <p className="text-xs text-gray-400 mt-2">
                Siswa terpilih:{" "}
                <span className="font-semibold">
                  {selectedSiswa.nama_lengkap || selectedSiswa.nama_siswa}
                </span>
              </p>
            )}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">Riwayat Progres PKL</h2>
              <p className="text-xs text-gray-400">
                Menampilkan progres yang sudah disimpan.
              </p>
            </div>

            <button
              onClick={loadProgres}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl"
            >
              Refresh
            </button>
          </div>

          {loadingProgres ? (
            <div className="py-12 text-center text-gray-400">
              Memuat progres PKL...
            </div>
          ) : filteredProgres.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              Belum ada progres PKL.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">Siswa</th>
                    <th className="px-5 py-3 text-center">Minggu</th>
                    <th className="px-5 py-3 text-left">Deskripsi</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {filteredProgres.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70">
                      <td className="px-5 py-3 font-semibold text-gray-800">
                        {getNamaSiswa(item)}
                      </td>

                      <td className="px-5 py-3 text-center text-gray-600">
                        Minggu {item.minggu_ke}
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        {item.deskripsi || "-"}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 text-xs font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold"
                          >
                            Hapus
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
