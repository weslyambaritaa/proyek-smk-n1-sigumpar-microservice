import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const BIDANG_OPTIONS = ["Kurikulum", "Kesiswaan", "Sarana & Prasarana", "Humas", "Lainnya"];
const STATUS_OPTIONS = [
  { value: "belum_mulai", label: "⏳ Belum Mulai", cls: "border-gray-400 bg-gray-50 text-gray-700" },
  { value: "sedang_berjalan", label: "🔄 Sedang Berjalan", cls: "border-blue-400 bg-blue-50 text-blue-700" },
  { value: "selesai", label: "✅ Selesai", cls: "border-green-400 bg-green-50 text-green-700" },
  { value: "ditunda", label: "⚠️ Ditunda", cls: "border-yellow-400 bg-yellow-50 text-yellow-700" },
];

const ProgramKerjaDialog = ({ isOpen, onClose, onSuccess, selectedItem }) => {
  const [formData, setFormData] = useState({
    nama_program: "",
    bidang: "Kurikulum",
    tanggal_mulai: "",
    tanggal_selesai: "",
    penanggung_jawab: "",
    status: "belum_mulai",
    deskripsi: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedItem) {
        setFormData({
          nama_program: selectedItem.nama_program || "",
          bidang: selectedItem.bidang || "Kurikulum",
          tanggal_mulai: selectedItem.tanggal_mulai?.split("T")[0] || "",
          tanggal_selesai: selectedItem.tanggal_selesai?.split("T")[0] || "",
          penanggung_jawab: selectedItem.penanggung_jawab || "",
          status: selectedItem.status || "belum_mulai",
          deskripsi: selectedItem.deskripsi || "",
        });
      } else {
        setFormData({ nama_program: "", bidang: "Kurikulum", tanggal_mulai: "", tanggal_selesai: "", penanggung_jawab: "", status: "belum_mulai", deskripsi: "" });
      }
    }
  }, [isOpen, selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_program.trim() || !formData.tanggal_mulai) { toast.error("Nama program dan tanggal mulai wajib diisi!"); return; }
    setLoading(true);
    try {
      if (selectedItem) {
        await academicApi.updateProgramKerja(selectedItem.id, formData);
        toast.success("Program kerja berhasil diperbarui!");
      } else {
        await academicApi.createProgramKerja(formData);
        toast.success("Program kerja berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error("Gagal menyimpan program kerja.");
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
              {selectedItem ? "Edit Program Kerja" : "Tambah Program Kerja"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Program Kerja Wakil Kepala Sekolah</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <Input
              label="Nama Program *"
              placeholder="Contoh: Workshop Kurikulum Merdeka"
              value={formData.nama_program}
              onChange={(e) => setFormData({ ...formData, nama_program: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Bidang</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                value={formData.bidang}
                onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
              >
                {BIDANG_OPTIONS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tanggal Mulai *"
                type="date"
                value={formData.tanggal_mulai}
                onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                required
              />
              <Input
                label="Tanggal Selesai"
                type="date"
                value={formData.tanggal_selesai}
                onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
              />
            </div>

            <Input
              label="Penanggung Jawab"
              placeholder="Nama penanggung jawab program"
              value={formData.penanggung_jawab}
              onChange={(e) => setFormData({ ...formData, penanggung_jawab: e.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.value })}
                    className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${
                      formData.status === opt.value ? opt.cls : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
              <textarea
                rows={3}
                placeholder="Deskripsi singkat program kerja..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
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

export default ProgramKerjaDialog;
