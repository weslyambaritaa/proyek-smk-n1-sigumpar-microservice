import React, { useState, useEffect } from "react";
import { academicApi } from "../../../../api/academicApi";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import toast from "react-hot-toast";

const JABATAN_OPTIONS = [
  "Guru Mapel",
  "Wali Kelas",
  "Guru BK",
  "Kepala Sekolah",
  "Wakil Kepala Sekolah",
  "Lainnya",
];

const GuruDialog = ({ isOpen, onClose, onSuccess, selectedGuru }) => {
  const [formData, setFormData] = useState({
    nip: "",
    nama_lengkap: "",
    email: "",
    jabatan: "",
    mata_pelajaran: "",
    no_telepon: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedGuru) {
        setFormData({
          nip: selectedGuru.nip || "",
          nama_lengkap: selectedGuru.nama_lengkap || "",
          email: selectedGuru.email || "",
          jabatan: selectedGuru.jabatan || "",
          mata_pelajaran: selectedGuru.mata_pelajaran || "",
          no_telepon: selectedGuru.no_telepon || "",
        });
      } else {
        setFormData({ nip: "", nama_lengkap: "", email: "", jabatan: "", mata_pelajaran: "", no_telepon: "" });
      }
    }
  }, [isOpen, selectedGuru]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedGuru) {
        await academicApi.updateGuru(selectedGuru.id, formData);
        toast.success("Data guru berhasil diperbarui!");
      } else {
        await academicApi.createGuru(formData);
        toast.success("Guru baru berhasil ditambahkan!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan data guru.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedGuru ? "Edit Data Guru" : "Tambah Guru Baru"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <Input
              label="NIP"
              placeholder="Masukkan Nomor Induk Pegawai"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              required
            />
            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap sesuai SK"
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
              required
            />
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Jabatan</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                required
              >
                <option value="">-- Pilih Jabatan --</option>
                {JABATAN_OPTIONS.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <Input
              label="Mata Pelajaran"
              placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia"
              value={formData.mata_pelajaran}
              onChange={(e) => setFormData({ ...formData, mata_pelajaran: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@guru.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="No. Telepon"
              placeholder="08xx-xxxx-xxxx"
              value={formData.no_telepon}
              onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
            />
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} type="button" disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuruDialog;
