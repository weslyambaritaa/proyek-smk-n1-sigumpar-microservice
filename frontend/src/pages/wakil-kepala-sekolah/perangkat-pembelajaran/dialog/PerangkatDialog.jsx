import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const JENIS_OPTIONS = ["RPP", "Silabus", "Prota", "Promes", "Modul", "Lainnya"];

const PerangkatDialog = ({ isOpen, onClose, onSuccess, selectedItem, guruId }) => {
  const [formData, setFormData] = useState({
    nama_perangkat: "",
    jenis: "RPP",
    status: "belum_lengkap",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedItem) {
        setFormData({
          nama_perangkat: selectedItem.nama_perangkat || "",
          jenis: selectedItem.jenis || "RPP",
          status: selectedItem.status || "belum_lengkap",
          catatan: selectedItem.catatan || "",
        });
      } else {
        setFormData({ nama_perangkat: "", jenis: "RPP", status: "belum_lengkap", catatan: "" });
      }
    }
  }, [isOpen, selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_perangkat.trim()) { toast.error("Nama perangkat wajib diisi!"); return; }
    setLoading(true);
    try {
      if (selectedItem) {
        await academicApi.updatePerangkat(selectedItem.id, formData);
        toast.success("Perangkat berhasil diperbarui!");
      } else {
        await academicApi.createPerangkat({ ...formData, guru_id: guruId });
        toast.success("Perangkat berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan data perangkat.");
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
              {selectedItem ? "Edit Perangkat" : "Tambah Perangkat"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Perangkat Pembelajaran Guru</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <Input
              label="Nama Perangkat"
              placeholder="Contoh: RPP Semester Ganjil, Silabus Kelas X"
              value={formData.nama_perangkat}
              onChange={(e) => setFormData({ ...formData, nama_perangkat: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Jenis Perangkat</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                required
              >
                {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { value: "lengkap", label: "✅ Lengkap", cls: "border-green-400 bg-green-50 text-green-700" },
                  { value: "belum_lengkap", label: "⏳ Belum Lengkap", cls: "border-red-400 bg-red-50 text-red-700" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.value })}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      formData.status === opt.value ? opt.cls : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm resize-none"
                rows={3}
                placeholder="Catatan tambahan..."
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerangkatDialog;
