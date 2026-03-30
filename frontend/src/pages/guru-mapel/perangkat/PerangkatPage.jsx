import React, { useState, useEffect, useRef } from 'react';
import { learningApi } from '../../../api/learningApi';
import toast from 'react-hot-toast';

const JENIS_DOKUMEN = ['RPP', 'Silabus', 'Modul', 'Prota', 'Promes', 'Lainnya'];

const badgeColor = {
  RPP:     'bg-blue-100 text-blue-700',
  Silabus: 'bg-green-100 text-green-700',
  Modul:   'bg-purple-100 text-purple-700',
  Prota:   'bg-yellow-100 text-yellow-700',
  Promes:  'bg-orange-100 text-orange-700',
  Lainnya: 'bg-gray-100 text-gray-600',
};

const PerangkatPage = () => {
  const [dokumen, setDokumen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [namaDokumen, setNamaDokumen] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('RPP');
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const fetchDokumen = async () => {
    setLoading(true);
    try {
      const res = await learningApi.getAllPerangkat();
      setDokumen(res.data.data || []);
    } catch {
      toast.error('Gagal memuat data dokumen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDokumen(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!namaDokumen.trim()) return toast.error('Nama dokumen wajib diisi');
    if (!file) return toast.error('Pilih file terlebih dahulu');

    const formData = new FormData();
    formData.append('nama_dokumen', namaDokumen.trim());
    formData.append('jenis_dokumen', jenisDokumen);
    formData.append('file', file);

    setUploading(true);
    const promise = learningApi.uploadPerangkat(formData);
    toast.promise(promise, {
      loading: 'Mengupload dokumen...',
      success: 'Dokumen berhasil diupload!',
      error: 'Gagal mengupload dokumen',
    });

    try {
      await promise;
      setNamaDokumen('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchDokumen();
    } catch {
      // error ditangani toast
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await learningApi.downloadPerangkat(doc.id, doc.file_name);
    } catch {
      toast.error('Gagal mendownload dokumen');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Hapus dokumen "${doc.nama_dokumen}"?`)) return;
    const promise = learningApi.deletePerangkat(doc.id);
    toast.promise(promise, {
      loading: 'Menghapus...',
      success: 'Dokumen berhasil dihapus',
      error: 'Gagal menghapus dokumen',
    });
    try {
      await promise;
      fetchDokumen();
    } catch {}
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Perangkat Pembelajaran</h1>
        <p className="text-gray-500 mt-1">Upload dan kelola dokumen perangkat pembelajaran Anda</p>
      </div>

      {/* Form Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload Dokumen Baru</h2>
        <form onSubmit={handleUpload}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Nama Dokumen */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Nama Dokumen
              </label>
              <input
                type="text"
                placeholder="Contoh: RPP Matematika"
                value={namaDokumen}
                onChange={(e) => setNamaDokumen(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Jenis Dokumen */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Jenis Dokumen
              </label>
              <select
                value={jenisDokumen}
                onChange={(e) => setJenisDokumen(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {JENIS_DOKUMEN.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Pilih File */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Pilih File (PDF/DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ref={fileRef}
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? 'Mengupload...' : 'Upload Dokumen'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Dokumen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Daftar Dokumen Terupload</h2>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {dokumen.length} FILE
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : dokumen.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📁</p>
            <p>Belum ada dokumen yang diupload</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Nama Dokumen</th>
                <th className="px-6 py-3 text-left">Jenis</th>
                <th className="px-6 py-3 text-left">Tanggal Upload</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dokumen.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800 uppercase">
                    {doc.nama_dokumen}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColor[doc.jenis_dokumen] || badgeColor['Lainnya']}`}>
                      {doc.jenis_dokumen}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{doc.tanggal_upload}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* Download */}
                      <button
                        onClick={() => handleDownload(doc)}
                        title="Download"
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                        </svg>
                      </button>
                      {/* Hapus */}
                      <button
                        onClick={() => handleDelete(doc)}
                        title="Hapus"
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

export default PerangkatPage;
