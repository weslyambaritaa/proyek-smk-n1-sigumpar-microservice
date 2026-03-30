import { useState, useEffect } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import toast from 'react-hot-toast';
import RefleksiDialog from './dialog/RefleksiDialog';
import { KONDISI_OPTIONS } from './dialog/RefleksiDialog';

// ── Initial Form State (sesuai backend) ──────────────────────
const initialForm = {
  kelas_id: '',
  tanggal: new Date().toISOString().split('T')[0],
  kondisi_kelas: 'baik',
  hal_positif: '',
  hal_perlu_perbaikan: '',
  rencana_tindak_lanjut: '',
  catatan_tambahan: '',
};

const RefleksiPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // ── Fetch Kelas List ───────────────────────────────────────
  useEffect(() => {
    const loadKelas = async () => {
      try {
        const res = await academicApi.getAllKelas();
        const kelasData = res.data?.data || res.data || [];
        setKelasList(kelasData);
        if (kelasData.length > 0) {
          setSelectedKelasId(String(kelasData[0].id));
        }
      } catch (err) {
        console.error('❌ Gagal load kelas:', err);
        toast.error('Gagal memuat daftar kelas');
      }
    };
    loadKelas();
  }, []);

  // ── Fetch Data Refleksi ────────────────────────────────────
  const fetchData = async () => {
    if (!selectedKelasId) return;
    
    setLoading(true);
    try {
      // ✅ Pass kelas_id ke API
      const res = await waliKelasApi.getAllRefleksi(selectedKelasId);
      setData(res.data?.data || res.data || []);
    } catch (err) {
      console.error('❌ Gagal load refleksi:', err);
      toast.error('Gagal memuat data refleksi');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch when kelas changed
  useEffect(() => {
    if (selectedKelasId) {
      fetchData();
    }
  }, [selectedKelasId]);

  // ── Handle Submit dari Dialog (dengan FormData) ─────────────
  const handleDialogSubmit = async (formData) => {
    // ✅ formData sudah berupa FormData object dari dialog
    try {
      if (editData) {
        // ✅ Mode Edit - pakai updateRefleksi dengan formData
        await waliKelasApi.updateRefleksi(editData.id, formData);
        toast.success('Refleksi berhasil diperbarui');
      } else {
        // ✅ Mode Tambah - pakai createRefleksi dengan formData
        await waliKelasApi.createRefleksi(formData);
        toast.success('Refleksi berhasil disimpan');
      }
      fetchData(); // Refresh table
    } catch (err) {
      console.error('❌ Error save refleksi:', err.response?.data || err);
      const msg = err.response?.data?.message || 
                  Object.values(err.response?.data?.errors || {}).flat().join('\n') ||
                  'Gagal menyimpan refleksi';
      toast.error(msg);
      throw err; // Re-throw agar dialog tahu ada error
    }
  };

  // ── Handle Edit ────────────────────────────────────────────
  const handleEdit = (item) => {
    setEditData(item);
    setDialogOpen(true);
  };

  // ── Handle Delete ──────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus refleksi ini?')) return;
    try {
      await waliKelasApi.deleteRefleksi(id);
      toast.success('Refleksi berhasil dihapus');
      fetchData();
    } catch (err) {
      console.error('❌ Gagal hapus:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus refleksi');
    }
  };

  // ── Render Label Kondisi Kelas ─────────────────────────────
  const getKondisiLabel = (value) => {
    const opt = KONDISI_OPTIONS.find(o => o.value === value);
    return opt ? opt.label : value;
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">📝 Refleksi Pembelajaran</h1>
        
        {/* ✅ Kelas Selector */}
        <select
          value={selectedKelasId}
          onChange={(e) => setSelectedKelasId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {kelasList.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {/* ── Tombol Tambah ──────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>✨</span> Tambah Refleksi
        </button>
      </div>

      {/* ── Loading State ──────────────────────────────────── */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <p className="animate-pulse">Memuat data refleksi...</p>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────── */}
      {!loading && data.length === 0 && selectedKelasId && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm text-gray-500">Belum ada catatan refleksi untuk kelas ini</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            + Buat refleksi pertama
          </button>
        </div>
      )}

      {/* ── List Refleksi ──────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <div className="grid gap-4">
          {data.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header: Tanggal + Kondisi */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400">
                    {new Date(item.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    🏫 {item.nama_kelas || `Kelas #${item.kelas_id}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  item.kondisi_kelas === 'sangat_baik' ? 'border-green-400 bg-green-50 text-green-700' :
                  item.kondisi_kelas === 'baik' ? 'border-blue-400 bg-blue-50 text-blue-700' :
                  item.kondisi_kelas === 'cukup' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' :
                  'border-red-400 bg-red-50 text-red-700'
                }`}>
                  {getKondisiLabel(item.kondisi_kelas)}
                </span>
              </div>

              {/* Konten */}
              <div className="space-y-3 text-sm">
                {item.hal_positif && (
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-1">✅ Hal Positif</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.hal_positif}</p>
                  </div>
                )}
                {item.hal_perlu_perbaikan && (
                  <div>
                    <p className="text-xs font-semibold text-orange-600 mb-1">⚠️ Perlu Perbaikan</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.hal_perlu_perbaikan}</p>
                  </div>
                )}
                {item.rencana_tindak_lanjut && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-1">📌 Rencana Tindak Lanjut</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.rencana_tindak_lanjut}</p>
                  </div>
                )}
                {item.catatan_tambahan && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">📝 Catatan</p>
                    <p className="text-gray-600 whitespace-pre-wrap">{item.catatan_tambahan}</p>
                  </div>
                )}
                
                {/* Lampiran Foto */}
                {item.foto_url && (
                  <div className="pt-2 border-t border-gray-100">
                    <a
                      href={item.foto_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      📎 Lihat Lampiran
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dialog Component ───────────────────────────────── */}
      <RefleksiDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSubmit={handleDialogSubmit}  // ✅ Terima formData, kirim ke API
        editData={editData}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RefleksiPage;