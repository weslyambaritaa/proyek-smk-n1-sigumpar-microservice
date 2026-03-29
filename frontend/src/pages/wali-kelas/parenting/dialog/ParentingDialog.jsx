import { useEffect, useState } from 'react';

const JENIS_KOMUNIKASI = [
  { value: 'tatap_muka', label: 'Tatap Muka' },
  { value: 'telepon',    label: 'Telepon'    },
  { value: 'whatsapp',   label: 'WhatsApp'   },
  { value: 'surat',      label: 'Surat'      },
];

const ParentingDialog = ({ isOpen, onClose, onSubmit, editData, siswaDiKelas }) => {
  const [form, setForm] = useState({
    siswa_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    topik: '',
    catatan: '',
    jenis_komunikasi: 'tatap_muka',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        siswa_id:         String(editData.siswa_id),
        tanggal:          editData.tanggal?.split('T')[0] ?? '',
        topik:            editData.topik ?? '',
        catatan:          editData.catatan ?? '',
        jenis_komunikasi: editData.jenis_komunikasi ?? 'tatap_muka',
      });
    } else {
      setForm({
        siswa_id: '',
        tanggal: new Date().toISOString().split('T')[0],
        topik: '',
        catatan: '',
        jenis_komunikasi: 'tatap_muka',
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.siswa_id || !form.tanggal || !form.topik.trim()) return;
    setLoading(true);
    await onSubmit({ ...form, siswa_id: parseInt(form.siswa_id) });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? 'Edit Catatan Parenting' : 'Tambah Catatan Parenting'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Siswa */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Siswa *</label>
            <select
              name="siswa_id"
              value={form.siswa_id}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Pilih siswa —</option>
              {siswaDiKelas.map(s => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nisn})</option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal *</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jenis Komunikasi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis Komunikasi</label>
            <div className="flex flex-wrap gap-2">
              {JENIS_KOMUNIKASI.map(j => (
                <button
                  key={j.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, jenis_komunikasi: j.value }))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.jenis_komunikasi === j.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topik */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Topik Pembicaraan *</label>
            <input
              type="text"
              name="topik"
              value={form.topik}
              onChange={handleChange}
              placeholder="mis. Perkembangan belajar siswa"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Catatan</label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              rows={3}
              placeholder="Catatan hasil pertemuan/komunikasi..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.siswa_id || !form.topik.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : editData ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentingDialog;
