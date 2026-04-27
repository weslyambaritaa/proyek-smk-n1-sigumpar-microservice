import { useEffect, useState } from "react";
import { learningApi } from "../../api/learningApi";

export default function AbsensiGuruPage() {
  const [foto, setFoto] = useState("");
  const [preview, setPreview] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAbsensi = async () => {
    try {
      const res = await learningApi.getAbsensiGuru();
      setRiwayat(res.data?.data || []);
    } catch (err) {
      console.error("Gagal memuat absensi guru:", err.response?.data || err);
    }
  };

  useEffect(() => {
    loadAbsensi();
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFoto(reader.result);
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("FOTO ADA?", !!foto);
      console.log("PANJANG FOTO:", foto?.length);

      if (!foto) {
        alert("Foto absensi wajib diunggah.");
        return;
      }

      setLoading(true);

      await learningApi.createAbsensiGuru({
        foto,
        keterangan,
      });

      alert("Absensi berhasil disimpan.");

      setFoto("");
      setPreview("");
      setKeterangan("");

      await loadAbsensi();
    } catch (err) {
      console.error("Gagal menyimpan absensi guru:", err.response?.data || err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Gagal menyimpan absensi guru",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Absensi Guru</h1>
        <p className="text-gray-600">
          Guru mapel melakukan absensi dirinya sendiri menggunakan foto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Form Absensi</h2>

          <div className="mb-4">
            <label className="block font-medium mb-2">Foto Absensi</label>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFotoChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview absensi"
                className="w-48 h-48 object-cover rounded-lg border"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block font-medium mb-2">Keterangan</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows="3"
              className="w-full border rounded-lg p-2"
              placeholder="Opsional"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Absensi"}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Riwayat Absensi</h2>

          {riwayat.length === 0 ? (
            <p className="text-gray-500">Belum ada riwayat absensi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tanggal</th>
                    <th className="border p-2 text-left">Jam Masuk</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((item) => (
                    <tr key={item.id_absensiGuru || item.id}>
                      <td className="border p-2">
                        {item.tanggal ? String(item.tanggal).slice(0, 10) : "-"}
                      </td>
                      <td className="border p-2">
                        {item.jamMasuk
                          ? new Date(item.jamMasuk).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="border p-2">{item.status || "-"}</td>
                      <td className="border p-2">{item.keterangan || "-"}</td>
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
