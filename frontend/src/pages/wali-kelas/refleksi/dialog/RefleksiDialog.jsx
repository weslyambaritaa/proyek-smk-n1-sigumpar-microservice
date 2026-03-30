import { useEffect, useRef, useState } from 'react';

// ── OPTIONS KONDISI KELAS ──────────────────────────────────────
export const KONDISI_OPTIONS = [
  { value: 'sangat_baik', label: '😊 Sangat Baik', cls: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'baik',        label: '🙂 Baik',        cls: 'border-blue-400 bg-blue-50 text-blue-700'  },
  { value: 'cukup',       label: '😐 Cukup',       cls: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { value: 'kurang',      label: '😟 Kurang',      cls: 'border-red-400 bg-red-50 text-red-700'    },
];

// ── COMPONENT ─────────────────────────────────────────────────
const RefleksiDialog = ({ isOpen, onClose, onSubmit, editData, kelasList }) => {
  const [form, setForm] = useState({
    kelas_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    kondisi_kelas: 'baik',
    hal_positif: '',
    hal_perlu_perbaikan: '',
    rencana_tindak_lanjut: '',
    catatan_tambahan: '',
  });
  
  // ✅ State untuk upload file
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  // ── Reset form saat dialog dibuka/ditutup ───────────────────
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Mode Edit
        setForm({
          kelas_id:               String(editData.kelas_id),
          tanggal:                editData.tanggal?.split('T')[0] ?? '',
          kondisi_kelas:          editData.kondisi_kelas ?? 'baik',
          hal_positif:            editData.hal_positif ?? '',
          hal_perlu_perbaikan:    editData.hal_perlu_perbaikan ?? '',
          rencana_tindak_lanjut:  editData.rencana_tindak_lanjut ?? '',
          catatan_tambahan:       editData.catatan_tambahan ?? '',
        });
        // Jika ada foto lama, tampilkan preview (opsional, butuh URL dari backend)
        if (editData.foto_url) {
          setFotoPreview(editData.foto_url);
        }
      } else {
        // Mode Tambah Baru
        setForm({
          kelas_id: kelasList[0]?.id ? String(kelasList[0].id) : '',
          tanggal: new Date().toISOString().split('T')[0],
          kondisi_kelas: 'baik',
          hal_positif: '',
          hal_perlu_perbaikan: '',
          rencana_tindak_lanjut: '',
          catatan_tambahan: '',
        });
      }
      // Reset file
      setFoto(null);
      setFotoPreview(null);
    }
  }, [editData, isOpen, kelasList]);

  if (!isOpen) return null;

  // ── Helpers ─────────────────────────────────────────────────
  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ✅ Validasi file (opsional tapi disarankan)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert('Ukuran file terlalu besar. Maksimal 2MB.');
      return;
    }
    
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const clearFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit Handler ──────────────────────────────────────────
  const handleSubmit = async () => {
    // Validasi field wajib
    if (!form.kelas_id || !form.tanggal || !form.kondisi_kelas) {
      alert('Kelas, Tanggal, dan Kondisi Kelas wajib diisi');
      return;
    }
    
    setLoading(true);

    try {
      // ✅ WAJIB pakai FormData karena ada upload file
      const formData = new FormData();
      formData.append('kelas_id', parseInt(form.kelas_id));
      formData.append('tanggal', form.tanggal);
      formData.append('kondisi_kelas', form.kondisi_kelas);
      formData.append('hal_positif', form.hal_positif);
      formData.append('hal_perlu_perbaikan', form.hal_perlu_perbaikan);
      formData.append('rencana_tindak_lanjut', form.rencana_tindak_lanjut);
      formData.append('catatan_tambahan', form.catatan_tambahan);
      
      // ✅ Append file jika ada
      if (foto) {
        formData.append('foto', foto); // Sesuaikan nama field dengan backend
      }
      
      // ✅ DEBUG: Lihat isi FormData (opsional, hapus di production)
      console.log('📤 [DEBUG] Refleksi FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File{${value.name}}` : value);
      }

      // ✅ Kirim ke API (pastikan waliKelasApi.createRefleksi terima formData)
      await onSubmit(formData);
      
      // Reset form setelah sukses
      onClose();
      
    } catch (err) {
      console.error('❌ Gagal menyimpan refleksi:', err);
      alert('Gagal menyimpan data. Cek console untuk detail error.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render UI ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? '✏️ Edit Refleksi' : '📝 Tambah Refleksi Kelas'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Kelas + Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kelas *</label>
              <select
                value={form.kelas_id}
                onChange={set('kelas_id')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal *</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={set('tanggal')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Kondisi Kelas */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Kondisi Kelas *</label>
            <div className="grid grid-cols-2 gap-2">
              {KONDISI_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, kondisi_kelas: opt.value }))}
                  className={`text-sm px-3 py-2 rounded-xl border-2 text-left font-medium transition-all ${
                    form.kondisi_kelas === opt.value 
                      ? `${opt.cls} ring-2 ring-offset-1` 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hal Positif */}
          <div>
            <label className="block text-xs font-semibold text-green-600 mb-1.5">✅ Hal Positif</label>
            <textarea
              value={form.hal_positif}
              onChange={set('hal_positif')}
              rows={2}
              placeholder="Apa yang berjalan baik minggu ini?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          {/* Hal Perlu Perbaikan */}
          <div>
            <label className="block text-xs font-semibold text-orange-600 mb-1.5">⚠️ Hal yang Perlu Diperbaiki</label>
            <textarea
              value={form.hal_perlu_perbaikan}
              onChange={set('hal_perlu_perbaikan')}
              rows={2}
              placeholder="Apa yang perlu ditingkatkan?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Rencana Tindak Lanjut */}
          <div>
            <label className="block text-xs font-semibold text-blue-600 mb-1.5">📌 Rencana Tindak Lanjut</label>
            <textarea
              value={form.rencana_tindak_lanjut}
              onChange={set('rencana_tindak_lanjut')}
              rows={2}
              placeholder="Apa rencana ke depannya?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan Tambahan</label>
            <textarea
              value={form.catatan_tambahan}
              onChange={set('catatan_tambahan')}
              rows={2}
              placeholder="Catatan lain-lain..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* ✅ Upload Foto/Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              📎 Foto / Dokumentasi (opsional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              {fotoPreview ? (
                <div className="relative">
                  {fotoPreview.startsWith('http') ? (
                    // Preview foto lama dari URL
                    <img src={fotoPreview} alt="preview" className="mx-auto max-h-32 rounded-lg object-cover" />
                  ) : (
                    // Preview file baru dari local
                    <img src={fotoPreview} alt="preview" className="mx-auto max-h-32 rounded-lg object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearFoto(); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Klik untuk ganti file</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-1">📁</p>
                  <p className="text-sm text-gray-400">Klik untuk upload foto/PDF</p>
                  <p className="text-xs text-gray-300 mt-1">Maks. 2MB • JPG, PNG, PDF</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : editData ? '💾 Simpan Perubahan' : '✨ Tambah Refleksi'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RefleksiDialog;