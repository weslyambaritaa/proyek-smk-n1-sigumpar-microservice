import { useEffect, useRef, useState } from 'react';

const ParentingDialog = ({ isOpen, onClose, onSubmit, kelasId }) => {
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kehadiran_ortu: '',
    agenda_utama: '',
    ringkasan_hasil: '',
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        kehadiran_ortu: '',
        agenda_utama: '',
        ringkasan_hasil: '',
      });
      setFoto(null);
      setFotoPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.tanggal || !form.agenda_utama.trim()) return;

    setLoading(true);

    // Wajib pakai FormData karena ada upload foto
    const formData = new FormData();
    formData.append('kelas_id', kelasId);
    formData.append('tanggal', form.tanggal);
    formData.append('kehadiran_ortu', form.kehadiran_ortu || 0);
    formData.append('agenda_utama', form.agenda_utama);
    formData.append('ringkasan_hasil', form.ringkasan_hasil);
    if (foto) {
      formData.append('foto', foto);
    }

    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Tambah Catatan Parenting</h2>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jumlah Kehadiran Ortu */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Jumlah Kehadiran Orang Tua
            </label>
            <input
              type="number"
              name="kehadiran_ortu"
              value={form.kehadiran_ortu}
              onChange={handleChange}
              min={0}
              placeholder="mis. 25"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Agenda Utama */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Agenda Utama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="agenda_utama"
              value={form.agenda_utama}
              onChange={handleChange}
              placeholder="mis. Pembahasan hasil belajar siswa"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ringkasan Hasil */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Ringkasan Hasil
            </label>
            <textarea
              name="ringkasan_hasil"
              value={form.ringkasan_hasil}
              onChange={handleChange}
              rows={3}
              placeholder="Ringkasan hasil pertemuan parenting..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Foto Kegiatan (opsional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="preview"
                  className="mx-auto max-h-32 rounded-lg object-cover"
                />
              ) : (
                <p className="text-sm text-gray-400">Klik untuk upload foto</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
            disabled={loading || !form.tanggal || !form.agenda_utama.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Tambah'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParentingDialog;