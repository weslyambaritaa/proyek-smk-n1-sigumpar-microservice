import { useState, useEffect } from 'react';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';
import toast from 'react-hot-toast';
import RefleksiDialog from './dialog/RefleksiDialog';
import { KONDISI_OPTIONS } from './dialog/RefleksiDialog';

const RefleksiPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fungsi untuk melihat file via axios agar token ter-attach
  const handleViewFile = async (foto_url) => {
    try {
      const res = await waliKelasApi.viewFile(foto_url);
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Gagal membuka file:', err);
      toast.error('Gagal membuka file');
    }
  };

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
      const res = await waliKelasApi.getAllRefleksi(selectedKelasId);
      setData(res.data?.data || res.data || []);
    } catch (err) {
      console.error('❌ Gagal load refleksi:', err);
      toast.error('Gagal memuat data refleksi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedKelasId) {
      fetchData();
    }
  }, [selectedKelasId]);

  // ── Handle Submit dari Dialog (dengan FormData) ─────────────
  const handleDialogSubmit = async (formData) => {
    try {
      if (editData) {
        await waliKelasApi.updateRefleksi(editData.id, formData);
        toast.success('Refleksi berhasil diperbarui');
      } else {
        await waliKelasApi.createRefleksi(formData);
        toast.success('Refleksi berhasil disimpan');
      }
      fetchData();
    } catch (err) {
      console.error('❌ Error save refleksi:', err.response?.data || err);
      const msg = err.response?.data?.message || 
                  Object.values(err.response?.data?.errors || {}).flat().join('\n') ||
                  'Gagal menyimpan refleksi';
      toast.error(msg);
      throw err;
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setDialogOpen(true);
  };

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

  const getKondisiLabel = (value) => {
    const opt = KONDISI_OPTIONS.find(o => o.value === value);
    return opt ? opt.label : value;
  };

  const getKondisiColor = (value) => {
    switch (value) {
      case 'sangat_baik': return 'border-green-500 bg-green-50 text-green-700';
      case 'baik':        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'cukup':       return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'kurang':      return 'border-red-500 bg-red-50 text-red-700';
      default:            return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-2xl">📝</span>
            Refleksi Pembelajaran
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-14">Pantau dan evaluasi perkembangan harian kelas Anda secara profesional.</p>
        </div>
        
        <div className="flex items-center gap-3 ml-14 md:ml-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Pilih Kelas</span>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              {kelasList.map(k => (
                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setDialogOpen(true);
            }}
            className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <span className="text-xl">+</span> Tambah Refleksi
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse tracking-widest uppercase text-xs">Menyelaraskan data...</p>
        </div>
      )}

      {!loading && data.length === 0 && selectedKelasId && (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
          <div className="text-7xl mb-6">📖</div>
          <h3 className="text-xl font-bold text-gray-700">Belum ada catatan refleksi</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Mulai tulis refleksi pertama Anda untuk mendokumentasikan perjalanan mengajar hari ini.</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-8 px-6 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            + Buat Refleksi Pertama
          </button>
        </div>
      )}

      {/* TIMELINE / CARDS LIST */}
      <div className="grid grid-cols-1 gap-8">
        {!loading && data.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
          >
            {/* Status Line Decorator */}
            <div className={`absolute top-0 left-0 bottom-0 w-2 ${getKondisiColor(item.kondisi_kelas).split(' ')[0].replace('border', 'bg')}`}></div>

            <div className="p-8">
              {/* Top Row: Info & Action */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div className="flex items-center gap-5">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center min-w-[70px] shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-black text-gray-800 leading-none mt-1">
                      {new Date(item.tanggal).getDate()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-800 capitalize leading-tight">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-blue-500 font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                        🏫 {item.nama_kelas || `Kelas #${item.kelas_id}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                  <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 shadow-sm ${getKondisiColor(item.kondisi_kelas)}`}>
                    {getKondisiLabel(item.kondisi_kelas)}
                  </span>
                  <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 ml-auto sm:ml-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                      title="Edit Refleksi"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Hapus Refleksi"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/40 p-6 rounded-3xl border border-gray-100/50">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="bg-green-100 p-1.5 rounded-lg text-xs">✅</span> Hal Positif
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold pl-1">
                      {item.hal_positif || <span className="text-gray-300 italic font-normal">Tidak ada catatan positif</span>}
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="bg-orange-100 p-1.5 rounded-lg text-xs">⚠️</span> Perlu Perbaikan
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-semibold pl-1">
                      {item.hal_perlu_perbaikan || <span className="text-gray-300 italic font-normal">Tidak ada catatan perbaikan</span>}
                    </p>
                  </section>
                </div>

                <div className="space-y-6 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8 pt-6 md:pt-0">
                  <section>
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="bg-blue-100 p-1.5 rounded-lg text-xs">📌</span> Rencana Lanjut
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed font-black pl-1">
                      {item.rencana_tindak_lanjut || <span className="text-gray-300 italic font-normal">Belum direncanakan</span>}
                    </p>
                  </section>
                  {item.catatan_tambahan && (
                    <section className="bg-white/80 p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Catatan Tambahan</h4>
                      <p className="text-[13px] text-gray-500 italic leading-snug">{item.catatan_tambahan}</p>
                    </section>
                  )}
                </div>
              </div>

              {/* Footer: Attachments */}
              {item.foto_url && (
                <div className="mt-6 flex justify-start">
                  <button
                    onClick={() => handleViewFile(item.foto_url)}
                    className="group/btn flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-[11px] font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <span className="text-lg group-hover/btn:scale-110 transition-transform">
                      {item.foto_url.endsWith('.pdf') ? '📄' : '🖼️'}
                    </span>
                    <span className="uppercase tracking-wider">
                      {item.foto_url.endsWith('.pdf') ? 'Dokumen PDF' : 'Lampiran Foto'}
                    </span>
                    <span className="text-gray-200 ml-1">|</span>
                    <span className="text-blue-500 font-black ml-1 group-hover/btn:translate-x-1 transition-transform">LIHAT</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <RefleksiDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSubmit={handleDialogSubmit}
        editData={editData}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RefleksiPage;
