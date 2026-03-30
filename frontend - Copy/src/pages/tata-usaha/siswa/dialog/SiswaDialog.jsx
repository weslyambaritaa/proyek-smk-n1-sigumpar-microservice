import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const SiswaDialog = ({ isOpen, onClose, onSuccess, selectedSiswa }) => {
  const [formData, setFormData] = useState({
    nisn: "",
    nama_lengkap: "",
    kelas_id: "",
  });
  const [listKelas, setListKelas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Efek untuk fetch data kelas dan reset form
  useEffect(() => {
    if (isOpen) {
      fetchKelas();
      if (selectedSiswa) {
        // Hanya ambil field yang diperlukan untuk form agar tidak konflik
        setFormData({
          nisn: selectedSiswa.nisn || "",
          nama_lengkap: selectedSiswa.nama_lengkap || "",
          kelas_id: selectedSiswa.kelas_id || "",
        });
      } else {
        setFormData({ nisn: "", nama_lengkap: "", kelas_id: "" });
      }
    }
  }, [isOpen, selectedSiswa]);

  const fetchKelas = async () => {
    try {
      const res = await academicApi.getAllKelas();
      // Pastikan mengambil array data (handle jika dibungkus res.data.data)
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setListKelas(data);
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedSiswa) {
        await academicApi.updateSiswa(selectedSiswa.id, formData);
        toast.success("Data siswa berhasil diperbarui!");
      } else {
        await academicApi.createSiswa(formData);
        toast.success("Siswa baru berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data siswa.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Container Panel Samping */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedSiswa ? "Edit Data Siswa" : "Tambah Siswa Baru"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <Input
              label="NISN"
              placeholder="Masukkan 10 digit NISN"
              value={formData.nisn}
              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
              required
            />
            
            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap sesuai ijazah"
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                Pilih Kelas
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.kelas_id}
                onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                required
              >
                <option value="">-- Klik untuk memilih kelas --</option>
                {listKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.tingkat} - {k.nama_kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Tombol */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={onClose} 
              type="button"
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiswaDialog;