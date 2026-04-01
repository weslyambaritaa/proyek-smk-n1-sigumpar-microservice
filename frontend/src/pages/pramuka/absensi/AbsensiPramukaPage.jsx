import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AbsensiPramukaPage = () => {
  // State Data Master
  const [reguList, setReguList] = useState([]);
  const [selectedRegu, setSelectedRegu] = useState('');
  const [siswaAbsensi, setSiswaAbsensi] = useState([]);
  
  // State Form Absensi & Laporan
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState('');
  const [fileLaporan, setFileLaporan] = useState(null); // Menyimpan objek file asli
  const [isSubmitting, setIsSubmitting] = useState(false); // Efek loading saat submit

  // Ambil daftar regu saat halaman dimuat
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vocationalApi.getAllRegu();
        setReguList(res.data || []);
      } catch (error) {
        toast.error("Gagal memuat daftar regu");
      }
    };
    fetch();
  }, []);

  // Ambil daftar siswa ketika regu dipilih/diubah
  useEffect(() => {
    if (selectedRegu) {
      const loadSiswa = async () => {
        try {
          const res = await vocationalApi.getSiswaByRegu(selectedRegu);
          // Tambahkan field status_kehadiran bawaan (Hadir) untuk dicentang dari awal
          setSiswaAbsensi(res.data.map(s => ({ ...s, status_kehadiran: 'Hadir' })));
        } catch (error) { 
          toast.error("Gagal mengambil data siswa dari regu tersebut"); 
        }
      };
      loadSiswa();
    } else {
      setSiswaAbsensi([]);
    }
  }, [selectedRegu]);

  // Fungsi toggle checkbox kehadiran
  const toggleKehadiran = (idSiswa) => {
    setSiswaAbsensi(siswaAbsensi.map(s => 
      s.id === idSiswa 
        ? { ...s, status_kehadiran: s.status_kehadiran === 'Hadir' ? 'Alpa' : 'Hadir' }
        : s
    ));
  };

  // Fungsi Submit Absensi dan File Laporan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegu) return toast.error("Pilih regu terlebih dahulu!");
    if (!deskripsi) return toast.error("Deskripsi laporan wajib diisi!");
    
    setIsSubmitting(true);
    let uploadedFileUrl = '';

    try {
      // 1. JIKA ADA FILE, UPLOAD TERLEBIH DAHULU KE BACKEND
      if (fileLaporan) {
        const formData = new FormData();
        formData.append('file_laporan', fileLaporan);
        
        // Panggil API upload (pastikan sudah ditambahkan di vocationalApi.js)
        const uploadRes = await vocationalApi.uploadFileLaporan(formData);
        uploadedFileUrl = uploadRes.data.file_url; // Dapatkan path file dari server
      }

      // 2. KIRIM DATA ABSENSI & LAPORAN
      const payload = {
        regu_id: selectedRegu,
        tanggal: tanggal,
        deskripsi: deskripsi,
        file_url: uploadedFileUrl, // Berisi URL gambar atau string kosong jika tidak ada file
        data_absensi: siswaAbsensi.map(s => ({
          siswa_id: s.id,
          status: s.status_kehadiran
        }))
      };

      await vocationalApi.submitAbsensiPramuka(payload);
      toast.success('Absensi & Laporan berhasil disimpan!');
      
      // Reset form setelah berhasil menyimpan
      setSelectedRegu(''); 
      setDeskripsi('');
      setFileLaporan(null);
      // Reset input file secara manual di DOM
      document.getElementById('fileUploadInput').value = '';
      
    } catch (error) { 
      toast.error('Gagal menyimpan data absensi dan laporan'); 
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Absensi & Laporan Pramuka</h1>
      
      {/* Bagian Filter Regu & Tanggal */}
      <div className="flex gap-4 mb-6">
        <select value={selectedRegu} onChange={(e) => setSelectedRegu(e.target.value)} className="flex-1 rounded-lg border-gray-300 p-2.5 shadow-sm">
          <option value="">-- Pilih Regu Pramuka --</option>
          {reguList.map(r => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
        </select>
        
        <input 
          type="date" 
          value={tanggal} 
          onChange={(e) => setTanggal(e.target.value)} 
          className="rounded-lg border-gray-300 p-2.5 shadow-sm" 
          required 
        />
      </div>

      {selectedRegu && siswaAbsensi.length > 0 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm">
          
          {/* TABEL KEHADIRAN SISWA */}
          <h2 className="text-lg font-bold mb-4 border-b pb-2 text-gray-700">Daftar Kehadiran Anggota</h2>
          <table className="w-full text-left mb-8">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3 rounded-tl-lg w-16">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3 text-center w-24">Hadir</th>
                <th className="p-3 rounded-tr-lg w-32">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {siswaAbsensi.map((s, index) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-sm">{index + 1}</td>
                  {/* Gunakan s.nama_lengkap agar data sesuai dengan backend Academic Service */}
                  <td className="p-3 font-medium text-gray-800">{s.nama_lengkap || 'Tanpa Nama'}</td>
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-green-600 rounded cursor-pointer"
                      checked={s.status_kehadiran === 'Hadir'}
                      onChange={() => toggleKehadiran(s.id)}
                    />
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status_kehadiran === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status_kehadiran}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* FORM PELAPORAN KEGIATAN */}
          <div className="bg-gray-50 p-5 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Laporan Kegiatan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Kegiatan <span className="text-red-500">*</span></label>
                <textarea 
                  rows="3" 
                  className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Misal: Latihan PBB, Pionering, dan Semaphore regu hari ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Bukti Foto Kegiatan (Opsional)</label>
                <input 
                  id="fileUploadInput"
                  type="file" 
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full rounded-lg border-gray-300 p-2 border bg-white shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                  onChange={(e) => setFileLaporan(e.target.files[0])}
                />
                <p className="text-xs text-gray-500 mt-1">Format didukung: JPG, PNG, PDF, DOC (Maks. ukuran direkomendasikan 2MB)</p>
              </div>
            </div>
          </div>

          {/* TOMBOL SUBMIT DENGAN EFEK LOADING */}
          <div className="flex justify-end border-t pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan Data...
                </>
              ) : (
                'Simpan Absensi & Laporan'
              )}
            </button>
          </div>
        </form>
      )}

      {/* STATE KETIKA REGU KOSONG ATAU BELUM ADA ANGGOTA */}
      {selectedRegu && siswaAbsensi.length === 0 && (
        <div className="text-center p-12 bg-gray-50 border rounded-lg text-gray-500 flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <p className="font-semibold text-lg">Belum Ada Anggota</p>
          <p className="text-sm">Belum ada anggota yang di-plotting ke regu ini. Silakan plot anggota terlebih dahulu.</p>
        </div>
      )}
    </div>
  );
};

export default AbsensiPramukaPage;