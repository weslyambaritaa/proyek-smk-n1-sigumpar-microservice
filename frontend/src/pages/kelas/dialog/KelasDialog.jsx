import React, { useState, useEffect } from 'react';
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { academicApi } from "../../../api/academicApi";
import toast from 'react-hot-toast';

const KelasDialog = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({ nama_kelas: '', tingkat: '', wali_kelas_id: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSearchQuery(initialData.nama_wali || '');
    } else {
      setFormData({ nama_kelas: '', tingkat: '', wali_kelas_id: '' });
      setSearchQuery('');
    }
  }, [initialData, isOpen]);

  // Auto-suggest Wali Kelas
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // UBAH MENJADI > 0 AGAR 1 HURUF LANGSUNG MENCARI
      if (searchQuery.length > 0 && !formData.wali_kelas_id) {
        try {
          const res = await academicApi.searchWaliKelas(searchQuery);
          setSuggestions(res.data);
        } catch (err) { console.error(err); }
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  // Gunakan toast.promise untuk efek loading otomatis!
  const savePromise = initialData?.id 
    ? academicApi.updateKelas(initialData.id, formData)
    : academicApi.createKelas(formData);

  toast.promise(savePromise, {
    loading: 'Menyimpan data...',
    success: 'Data kelas berhasil disimpan!',
    error: 'Gagal menyimpan data kelas.',
  }).then(() => {
    onSuccess();
    onClose();
  }).catch((err) => {
    console.error(err); // Error detail tetap di console, user melihat pesan toast
  });
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Kelas" : "Tambah Kelas"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nama Kelas" 
          value={formData.nama_kelas} 
          onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})}
          required 
        />
        <Input 
          label="Tingkat" 
          value={formData.tingkat} 
          onChange={(e) => setFormData({...formData, tingkat: e.target.value})}
          placeholder="Contoh: X, XI, atau XII"
          required 
        />
        
        <div className="relative">
          <Input 
            label="Cari Wali Kelas" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFormData({...formData, wali_kelas_id: ''}); // Reset ID jika user mengetik ulang
            }}
            placeholder="Ketik nama guru..."
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border shadow-lg max-h-40 overflow-auto rounded-md">
              {suggestions.map(user => (
                <li 
                  key={user.id} 
                  className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                  onClick={() => {
                    setFormData({...formData, wali_kelas_id: user.id});
                    setSearchQuery(user.nama_lengkap);
                    setSuggestions([]);
                  }}
                >
                  {user.nama_lengkap}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary">Simpan</Button>
        </div>
      </form>
    </Modal>
  );
};

export default KelasDialog;