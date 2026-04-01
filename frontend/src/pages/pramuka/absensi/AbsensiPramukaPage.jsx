import React, { useState, useEffect } from 'react';
import { vocationalApi } from '../../../api/vocationalApi';
import toast from 'react-hot-toast';

const AbsensiPramukaPage = () => {
  const [reguList, setReguList] = useState([]);
  const [selectedRegu, setSelectedRegu] = useState('');
  const [siswaAbsensi, setSiswaAbsensi] = useState([]);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState('');
  const [fileLaporan, setFileLaporan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vocationalApi.getAllRegu();
        setReguList(res.data || []);
      } catch (error) {
        toast.error('Gagal memuat daftar regu');
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (selectedRegu) {
      const loadSiswa = async () => {
        setIsLoadingSiswa(true);
        try {
          const res = await vocationalApi.getSiswaByRegu(selectedRegu);
          setSiswaAbsensi(res.data.map(s => ({ ...s, status_kehadiran: 'Hadir' })));
        } catch (error) {
          toast.error('Gagal mengambil data siswa dari regu tersebut');
        } finally {
          setIsLoadingSiswa(false);
        }
      };
      loadSiswa();
    } else {
      setSiswaAbsensi([]);
    }
  }, [selectedRegu]);

  const toggleKehadiran = (idSiswa) => {
    setSiswaAbsensi(siswaAbsensi.map(s =>
      s.id === idSiswa
        ? { ...s, status_kehadiran: s.status_kehadiran === 'Hadir' ? 'Alpa' : 'Hadir' }
        : s
    ));
  };

  const jumlahHadir = siswaAbsensi.filter(s => s.status_kehadiran === 'Hadir').length;
  const jumlahAlpa = siswaAbsensi.length - jumlahHadir;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRegu) return toast.error('Pilih regu terlebih dahulu!');
    if (!deskripsi) return toast.error('Deskripsi laporan wajib diisi!');
    setIsSubmitting(true);
    let uploadedFileUrl = '';
    try {
      if (fileLaporan) {
        const formData = new FormData();
        formData.append('file_laporan', fileLaporan);
        const uploadRes = await vocationalApi.uploadFileLaporan(formData);
        uploadedFileUrl = uploadRes.data.file_url;
      }
      await vocationalApi.submitAbsensiPramuka({
        regu_id: selectedRegu,
        tanggal,
        deskripsi,
        file_url: uploadedFileUrl,
        data_absensi: siswaAbsensi.map(s => ({ siswa_id: s.id, status: s.status_kehadiran }))
      });
      toast.success('Absensi & Laporan berhasil disimpan!');
      setSelectedRegu('');
      setDeskripsi('');
      setFileLaporan(null);
      document.getElementById('fileUploadInput').value = '';
    } catch (error) {
      toast.error('Gagal menyimpan data absensi dan laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReguNama = reguList.find(r => String(r.id) === String(selectedRegu))?.nama_regu;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Absensi & Laporan Pramuka</h1>
        <p className="text-sm text-gray-500 mt-1">Catat kehadiran anggota dan laporan kegiatan pramuka</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pilih Regu</label>
            <select
              value={selectedRegu}
              onChange={(e) => setSelectedRegu(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            >
              <option value="">-- Pilih Regu Pramuka --</option>
              {reguList.map(r => <option key={r.id} value={r.id}>{r.nama_regu}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tanggal Kegiatan</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Loading siswa */}
      {selectedRegu && isLoadingSiswa && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p>Memuat data anggota regu...</p>
          </div>
        </div>
      )}

      {/* Form Absensi */}
      {selectedRegu && !isLoadingSiswa && siswaAbsensi.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{siswaAbsensi.length}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Total Anggota</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{jumlahHadir}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">Hadir</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-red-600">{jumlahAlpa}</p>
              <p className="text-xs text-red-600 mt-1 font-medium">Tidak Hadir</p>
            </div>
          </div>

          {/* Tabel Kehadiran */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-700">Daftar Kehadiran Anggota</h2>
                <p className="text-xs text-gray-500 mt-0.5">Regu: <span className="font-semibold text-green-600">{selectedReguNama}</span> · {tanggal}</p>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 w-12">No</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4 text-center w-20">Hadir</th>
                  <th className="px-6 py-4 w-28">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {siswaAbsensi.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${s.status_kehadiran === 'Hadir' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <span className={`text-xs font-bold ${s.status_kehadiran === 'Hadir' ? 'text-green-700' : 'text-gray-400'}`}>
                            {s.nama_lengkap?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{s.nama_lengkap || 'Tanpa Nama'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-green-600 rounded cursor-pointer accent-green-600"
                        checked={s.status_kehadiran === 'Hadir'}
                        onChange={() => toggleKehadiran(s.id)}
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status_kehadiran === 'Hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.status_kehadiran}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Laporan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-700 mb-5">Laporan Kegiatan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deskripsi Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                  placeholder="Contoh: Latihan PBB, Pionering, dan Semaphore regu hari ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload Bukti Foto Kegiatan <span className="text-gray-400 font-normal">(Opsional)</span></label>
                <input
                  id="fileUploadInput"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer border border-gray-300 rounded-lg p-2 bg-white"
                  onChange={(e) => setFileLaporan(e.target.files[0])}
                />
                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF, DOC (Maks. 2MB)</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : 'Simpan Absensi & Laporan'}
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {selectedRegu && !isLoadingSiswa && siswaAbsensi.length === 0 && (
        <div className="text-center p-14 bg-white border border-gray-200 rounded-xl text-gray-400 flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="font-semibold text-lg text-gray-600">Belum Ada Anggota</p>
          <p className="text-sm mt-1">Belum ada anggota di regu ini. Silakan plotting anggota terlebih dahulu.</p>
        </div>
      )}

      {/* Placeholder saat belum pilih regu */}
      {!selectedRegu && (
        <div className="text-center p-14 bg-white border border-dashed border-gray-300 rounded-xl text-gray-400 flex flex-col items-center">
          <span className="text-5xl mb-4">⛺</span>
          <p className="font-semibold text-gray-600">Pilih Regu Terlebih Dahulu</p>
          <p className="text-sm mt-1">Pilih regu dan tanggal di atas untuk memulai absensi</p>
        </div>
      )}
    </div>
  );
};

export default AbsensiPramukaPage;
