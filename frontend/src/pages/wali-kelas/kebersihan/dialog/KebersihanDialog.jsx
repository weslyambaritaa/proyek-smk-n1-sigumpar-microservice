import { useEffect, useState } from 'react';

const ASPEK_DEFAULT = { lantai: 0, meja: 0, papan_tulis: 0, tempat_sampah: 0 };
const ASPEK_LABEL   = { lantai: 'Lantai', meja: 'Meja & Kursi', papan_tulis: 'Papan Tulis', tempat_sampah: 'Tempat Sampah' };

const KebersihanDialog = ({ isOpen, onClose, onSubmit, editData, kelasList }) => {
  const [form, setForm] = useState({
    kelas_id: '',
    tanggal_penilaian: new Date().toISOString().split('T')[0],
    petugas_piket: '',   // input string, dikonversi ke array saat submit
    skor: 80,
    aspek_penilaian: { ...ASPEK_DEFAULT },
    catatan: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        kelas_id:          String(editData.kelas_id),
        tanggal_penilaian: editData.tanggal_penilaian?.split('T')[0] ?? '',
        petugas_piket:     (editData.petugas_piket || []).join(', '),
        skor:              editData.skor ?? 80,
        aspek_penilaian:   editData.aspek_penilaian || { ...ASPEK_DEFAULT },
        catatan:           editData.catatan ?? '',
      });
    } else {
      setForm({
        kelas_id: kelasList[0]?.id ? String(kelasList[0].id) : '',
        tanggal_penilaian: new Date().toISOString().split('T')[0],
        petugas_piket: '',
        skor: 80,
        aspek_penilaian: { ...ASPEK_DEFAULT },
        catatan: '',
      });
    }
  }, [editData, isOpen, kelasList]);

  if (!isOpen) return null;

  const handleAspek = (key, val) => {
    setForm(prev => ({
      ...prev,
      aspek_penilaian: { ...prev.aspek_penilaian, [key]: Number(val) }
    }));
  };

  const handleSubmit = async () => {
    if (!form.kelas_id || !form.tanggal_penilaian) return;
    setLoading(true);
    const payload = {
      ...form,
      kelas_id: parseInt(form.kelas_id),
      skor: Number(form.skor),
      petugas_piket: form.petugas_piket
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    };
    await onSubmit(payload);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? 'Edit Penilaian Kebersihan' : 'Tambah Penilaian Kebersihan'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kelas *</label>
            <select
              value={form.kelas_id}
              onChange={e => setForm(p => ({ ...p, kelas_id: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Penilaian *</label>
            <input
              type="date"
              value={form.tanggal_penilaian}
              onChange={e => setForm(p => ({ ...p, tanggal_penilaian: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Petugas Piket */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Petugas Piket <span className="font-normal text-gray-400">(pisahkan dengan koma)</span>
            </label>
            <input
              type="text"
              value={form.petugas_piket}
              onChange={e => setForm(p => ({ ...p, petugas_piket: e.target.value }))}
              placeholder="Budi, Siti, Joko"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skor Total */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Skor Total: <span className="text-blue-600 font-bold">{form.skor}</span> / 100
            </label>
            <input
              type="range"
              min={0} max={100} step={5}
              value={form.skor}
              onChange={e => setForm(p => ({ ...p, skor: Number(e.target.value) }))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Aspek Penilaian */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Aspek Penilaian (0–100)</label>
            <div className="space-y-2">
              {Object.entries(ASPEK_LABEL).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
                  <input
                    type="range"
                    min={0} max={100} step={5}
                    value={form.aspek_penilaian[key] || 0}
                    onChange={e => handleAspek(key, e.target.value)}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                    {form.aspek_penilaian[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan</label>
            <textarea
              value={form.catatan}
              onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
              rows={2}
              placeholder="Catatan tambahan..."
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

export default KebersihanDialog;
