import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { waliKelasApi } from '../../../api/waliKelasApi';
import { academicApi } from '../../../api/academicApi';

const ParentingPage = () => {
  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isKelasLoaded, setIsKelasLoaded] = useState(false); // ✅ Track loading kelas

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    tanggal: today,
    kehadiran_ortu: '',
    agenda_utama: '',
    ringkasan_hasil: '',
    foto: null,
  });

  // 🔹 Fetch daftar kelas
  useEffect(() => {
    const loadKelas = async () => {
      try {
        console.log('📡 Fetching kelas list...');
        const res = await academicApi.getAllKelas();
        console.log('✅ Kelas response:', res.data);
        
        const kelasData = res.data || [];
        setKelasList(kelasData);
        
        if (kelasData.length > 0) {
          // ✅ Pastikan ID dikonversi ke string untuk konsistensi
          const firstId = String(kelasData[0].id);
          console.log('🎯 Set selectedKelasId:', firstId);
          setSelectedKelasId(firstId);
        } else {
          console.warn('⚠️ Tidak ada data kelas ditemukan');
          toast.error('Daftar kelas kosong');
        }
      } catch (err) {
        console.error('❌ Gagal memuat daftar kelas:', err);
        toast.error('Gagal memuat daftar kelas. Cek koneksi atau API.');
      } finally {
        setIsKelasLoaded(true); // ✅ Mark as loaded (even if failed)
      }
    };
    
    loadKelas();
  }, []);

  // 🔹 Fetch data parenting ketika kelas dipilih
  useEffect(() => {
    if (selectedKelasId) {
      console.log('🔄 selectedKelasId berubah, fetch parenting:', selectedKelasId);
      fetchData();
    }
  }, [selectedKelasId]);

  const fetchData = () => {
    setLoading(true);
    waliKelasApi.getAllParenting(selectedKelasId)
      .then(res => {
        console.log('✅ Parenting data:', res.data?.data);
        setData(res.data?.data || []);
      })
      .catch((err) => {
        console.error('❌ Gagal memuat data parenting:', err.response?.data || err);
        toast.error('Gagal memuat data parenting');
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    // 🔍 Validasi 1: Pastikan kelas sudah loaded
    if (!isKelasLoaded) {
      toast.error('Masih memuat daftar kelas, tunggu sebentar...');
      console.warn('⚠️ Submit ditolak: kelas belum loaded');
      return;
    }
    
    // 🔍 Validasi 2: selectedKelasId harus ada
    if (!selectedKelasId) {
      toast.error('Pilih kelas terlebih dahulu');
      console.error('❌ Validation Error: selectedKelasId kosong');
      console.error('   - kelasList:', kelasList);
      console.error('   - selectedKelasId:', selectedKelasId);
      console.error('   - isKelasLoaded:', isKelasLoaded);
      return;
    }
    
    // 🔍 Validasi 3: Field wajib form
    if (!form.tanggal || !form.agenda_utama.trim()) {
      toast.error('Tanggal dan agenda utama wajib diisi');
      console.error('❌ Validation Error: tanggal/agenda_utama kosong');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('kelas_id', selectedKelasId);
      fd.append('tanggal', form.tanggal);
      fd.append('kehadiran_ortu', form.kehadiran_ortu || 0);
      fd.append('agenda_utama', form.agenda_utama);
      fd.append('ringkasan_hasil', form.ringkasan_hasil);
      if (form.foto) fd.append('foto', form.foto);

      // 🔍 DEBUG: Log FormData
      console.log('📤 [DEBUG] FormData entries:');
      for (let [key, value] of fd.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File { name: "${value.name}", size: ${value.size} bytes }`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log('📤 Sending POST to /api/academic/walas/parenting');
      const response = await waliKelasApi.createParenting(fd);
      
      console.log('✅ Response success:', response.data);
      toast.success('Laporan parenting berhasil disimpan');
      
      // Reset form
      setForm({ 
        tanggal: today, 
        kehadiran_ortu: '', 
        agenda_utama: '', 
        ringkasan_hasil: '', 
        foto: null 
      });
      fetchData();
      
    } catch (err) {
      // 🔍 Detail error logging
      console.error('❌❌❌ [ERROR DETAIL] ❌❌❌');
      console.error('├─ Status:', err.response?.status);
      console.error('├─ Message:', err.response?.data?.message);
      console.error('├─ Errors:', err.response?.data?.errors);
      console.error('└─ Full:', err);
      
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const msgs = Object.values(validationErrors).flat().join('\n');
        toast.error(`Validasi gagal:\n${msgs}`);
      } else {
        toast.error(err.response?.data?.message || 'Gagal menyimpan laporan parenting');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan pertemuan ini?')) return;
    try {
      await waliKelasApi.deleteParenting(id);
      toast.success('Catatan berhasil dihapus');
      fetchData();
    } catch (err) {
      console.error('❌ Gagal menghapus:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Gagal menghapus catatan');
    }
  };

  const selectedKelas = kelasList.find(k => String(k.id) === selectedKelasId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Parenting Kelas Massal</h1>
          {selectedKelas ? (
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              Wali Kelas | {selectedKelas.nama_kelas}
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-0.5">
              {isKelasLoaded ? 'Pilih kelas dari dropdown →' : 'Memuat daftar kelas...'}
            </p>
          )}
        </div>
        
        {/* ✅ Disable select jika kelas belum loaded */}
        <select
          value={selectedKelasId}
          onChange={e => {
            const val = e.target.value;
            console.log('🔄 Kelas diubah ke:', val);
            setSelectedKelasId(val);
          }}
          disabled={!isKelasLoaded || kelasList.length === 0}
          className={`border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${(!isKelasLoaded || kelasList.length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          {!isKelasLoaded ? (
            <option value="">Memuat kelas...</option>
          ) : kelasList.length === 0 ? (
            <option value="">Tidak ada kelas</option>
          ) : (
            kelasList.map(k => (
              <option key={k.id} value={String(k.id)}>{k.nama_kelas}</option>
            ))
          )}
        </select>
      </div>

      {/* Form Catat Pertemuan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">👥</div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Catat Pertemuan &amp; Upload Dokumentasi
          </h2>
        </div>

        {/* ✅ Tampilkan warning jika kelas belum dipilih */}
        {!selectedKelasId && isKelasLoaded && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
            ⚠️ Silakan pilih kelas terlebih dahulu dari dropdown di atas
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Tanggal Pertemuan
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Kehadiran Orang Tua */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Kehadiran Orang Tua
            </label>
            <input
              type="number"
              min={0}
              value={form.kehadiran_ortu}
              onChange={e => setForm(p => ({ ...p, kehadiran_ortu: e.target.value }))}
              placeholder="Jml Hadir"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Agenda Utama */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Agenda Utama
            </label>
            <input
              type="text"
              value={form.agenda_utama}
              onChange={e => setForm(p => ({ ...p, agenda_utama: e.target.value }))}
              placeholder="Judul rapat..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Upload Foto/Dokumen */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Upload Foto/Dokumen
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={e => {
                const file = e.target.files[0] || null;
                if (file) {
                  console.log('📎 File selected:', file.name, file.size, file.type);
                }
                setForm(p => ({ ...p, foto: file }));
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-600"
            />
          </div>
        </div>

        {/* Ringkasan Hasil */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Hasil Keputusan / Catatan Penting
          </label>
          <textarea
            value={form.ringkasan_hasil}
            onChange={e => setForm(p => ({ ...p, ringkasan_hasil: e.target.value }))}
            rows={3}
            placeholder="Ringkasan hasil pertemuan..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* ✅ Disable button jika kelas belum dipilih atau masih loading */}
        <button
          onClick={handleSubmit}
          disabled={saving || !selectedKelasId || !isKelasLoaded}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isKelasLoaded ? 'Memuat kelas...' : !selectedKelasId ? 'Pilih kelas dulu' : saving ? 'Menyimpan...' : 'Simpan Laporan & Lampiran'}
        </button>
      </div>

      {/* Histori Pertemuan */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Histori Pertemuan Kelas
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👨‍👩‍👧</p>
            <p className="text-sm">Belum ada catatan pertemuan parenting</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3 font-semibold">No</th>
                <th className="px-6 py-3 font-semibold">Tanggal &amp; Agenda</th>
                <th className="px-6 py-3 font-semibold">Kehadiran</th>
                <th className="px-6 py-3 font-semibold">Ringkasan Hasil</th>
                <th className="px-6 py-3 font-semibold">Lampiran</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <p className="text-blue-600 text-xs mb-0.5">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        year: 'numeric', month: '2-digit', day: '2-digit'
                      })}
                    </p>
                    <p className="font-semibold text-gray-800 uppercase text-xs">
                      {item.agenda_utama}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 font-semibold text-xs">
                      {item.kehadiran_ortu || 0} ORANGTUA
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs text-xs">
                    {item.ringkasan_hasil || '—'}
                  </td>
                  <td className="px-6 py-4">
                    {item.foto_url ? (
                      <a
                        href={item.foto_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs font-semibold uppercase"
                      >
                        Lihat File
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ParentingPage;