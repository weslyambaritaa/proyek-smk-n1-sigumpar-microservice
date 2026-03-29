import { useEffect, useState } from 'react';

const KONDISI_OPTIONS = [
  { value: 'sangat_baik', label: '😊 Sangat Baik', cls: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'baik',        label: '🙂 Baik',        cls: 'border-blue-400 bg-blue-50 text-blue-700'  },
  { value: 'cukup',       label: '😐 Cukup',       cls: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { value: 'kurang',      label: '😟 Kurang',      cls: 'border-red-400 bg-red-50 text-red-700'    },
];

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        kelas_id:               String(editData.kelas_id),
        tanggal:                editData.tanggal?.split('T')[0] ?? '',
        kondisi_kelas:          editData.kondisi_kelas ?? 'baik',
        hal_positif:            editData.hal_positif ?? '',
        hal_perlu_perbaikan:    editData.hal_perlu_perbaikan ?? '',
        rencana_tindak_lanjut:  editData.rencana_tindak_lanjut ?? '',
        catatan_tambahan:       editData.catatan_tambahan ?? '',
      });
    } else {
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
  }, [editData, isOpen, kelasList]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.kelas_id || !form.tanggal || !form.kondisi_kelas) return;
    setLoading(true);
    await onSubmit({ ...form, kelas_id: parseInt(form.kelas_id) });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? 'Edit Refleksi' : 'Tambah Refleksi Kelas'}
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
                    form.kondisi_kelas === opt.value ? opt.cls : 'border-gray-200 text-gray-500 hover:border-gray-300'
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
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefleksiDialog;
