import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const ASPEK_OPTIONS = [
  "Pembukaan Pembelajaran",
  "Penguasaan Materi",
  "Metode Mengajar",
  "Pengelolaan Kelas",
  "Penggunaan Media",
  "Interaksi dengan Siswa",
  "Penutup Pembelajaran",
];

const SupervisiDialog = ({ isOpen, onClose, onSuccess, selectedItem }) => {
  const [guruList, setGuruList] = useState([]);
  const [formData, setFormData] = useState({
    guru_id: "",
    tanggal: "",
    kelas: "",
    mata_pelajaran: "",
    aspek_penilaian: "",
    nilai: "",
    catatan: "",
    rekomendasi: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    academicApi.getAllGuru()
      .then(res => setGuruList(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(() => setGuruList([]));
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (selectedItem) {
        setFormData({
          guru_id: selectedItem.guru_id || "",
          tanggal: selectedItem.tanggal?.split("T")[0] || "",
          kelas: selectedItem.kelas || "",
          mata_pelajaran: selectedItem.mata_pelajaran || "",
          aspek_penilaian: selectedItem.aspek_penilaian || "",
          nilai: selectedItem.nilai || "",
          catatan: selectedItem.catatan || "",
          rekomendasi: selectedItem.rekomendasi || "",
        });
      } else {
        setFormData({ guru_id: "", tanggal: new Date().toISOString().split("T")[0], kelas: "", mata_pelajaran: "", aspek_penilaian: "", nilai: "", catatan: "", rekomendasi: "" });
      }
    }
  }, [isOpen, selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guru_id || !formData.tanggal) { toast.error("Guru dan tanggal wajib diisi!"); return; }
    setLoading(true);
    try {
      if (selectedItem) {
        await academicApi.updateSupervisi(selectedItem.id, formData);
        toast.success("Data supervisi berhasil diperbarui!");
      } else {
        await academicApi.createSupervisi(formData);
        toast.success("Data supervisi berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menyimpan data supervisi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedItem ? "Edit Supervisi" : "Tambah Supervisi"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Data Supervisi Kunjungan Kelas</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Guru <span className="text-red-500">*</span></label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                value={formData.guru_id}
                onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                required
              >
                <option value="">-- Pilih Guru --</option>
                {guruList.map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
              </select>
            </div>

            <Input
              label="Tanggal Supervisi *"
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kelas"
                placeholder="Contoh: X IPA 1"
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              />
              <Input
                label="Mata Pelajaran"
                placeholder="Contoh: Matematika"
                value={formData.mata_pelajaran}
                onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Aspek yang Diamati</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                value={formData.aspek_penilaian}
                onChange={(e) => setFormData({ ...formData, aspek_penilaian: e.target.value })}
              >
                <option value="">-- Pilih Aspek --</option>
                {ASPEK_OPTIONS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Nilai <span className="text-gray-400 font-normal">(0–100)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Misal: 85"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                value={formData.nilai}
                onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Catatan Observasi</label>
              <textarea
                rows={3}
                placeholder="Catatan hasil supervisi..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Rekomendasi / Tindak Lanjut</label>
              <textarea
                rows={2}
                placeholder="Rekomendasi untuk guru..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none"
                value={formData.rekomendasi}
                onChange={(e) => setFormData({ ...formData, rekomendasi: e.target.value })}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisiDialog;
