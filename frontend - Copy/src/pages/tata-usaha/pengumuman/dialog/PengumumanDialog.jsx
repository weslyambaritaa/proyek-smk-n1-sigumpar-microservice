import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const PengumumanDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({ judul: "", isi: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ 
          judul: initialData.judul || "", 
          isi: initialData.isi || "" 
        });
      } else {
        setFormData({ judul: "", isi: "" });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await academicApi.updatePengumuman(initialData.id, formData);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        await academicApi.createPengumuman(formData);
        toast.success("Pengumuman baru berhasil dipublikasikan!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan pengumuman.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        <div className="px-6 py-4 border-b">
          {/* Warna judul diubah menjadi Gray-800 agar konsisten */}
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit Pengumuman" : "Tambah Pengumuman"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
            <Input 
              label="Judul Pengumuman" 
              value={formData.judul} 
              onChange={(e) => setFormData({...formData, judul: e.target.value})} 
              required 
              placeholder="Contoh: Libur Semester Ganjil"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Isi Pengumuman</label>
              <textarea
                
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-48"
                value={formData.isi}
                onChange={(e) => setFormData({...formData, isi: e.target.value})}
                required
                placeholder="Tuliskan isi pengumuman secara lengkap di sini..."
              ></textarea>
            </div>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={loading}>Batal</Button>
            {/* Tombol Simpan menggunakan Blue-600 sesuai tema Siswa/Kelas */}
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300 transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PengumumanDialog;