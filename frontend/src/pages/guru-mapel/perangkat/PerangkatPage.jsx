import React, { useState, useEffect, useRef } from 'react';
import { learningApi } from '../../../api/learningApi';
import toast from 'react-hot-toast';

// Hanya 3 jenis dokumen: RPP, Silabus, Modul
const JENIS_DOKUMEN = ['RPP', 'Silabus', 'Modul'];

const badgeColor = {
  RPP:     'bg-blue-100 text-blue-700',
  Silabus: 'bg-green-100 text-green-700',
  Modul:   'bg-purple-100 text-purple-700',
};

const isImageMime = (mime) => mime && mime.startsWith('image/');
const isPdfMime   = (mime) => mime === 'application/pdf';

// Modal Preview
function PreviewModal({ doc, onClose }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    setError(null);
    import('../../../api/axiosInstance').then(({ default: api }) => {
      api.get(`/api/learning/perangkat/${doc.id}/download`, { responseType: 'blob' })
        .then(res => {
          const mime = res.headers['content-type'] || doc.file_mime || 'application/octet-stream';
          const blob = new Blob([res.data], { type: mime });
          const url = URL.createObjectURL(blob);
          setSrc({ url, mime });
          setLoading(false);
        })
        .catch(() => { setError('Gagal memuat file'); setLoading(false); });
    });
    return () => { if (src?.url) URL.revokeObjectURL(src.url); };
  }, [doc]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{doc.nama_dokumen}</h2>
            <p className="text-xs text-gray-400">{doc.file_name} • {doc.jenis_dokumen}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)}
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors"
            >⬇ Download</button>
            <button onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">✕ Tutup</button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[400px]">
          {loading && (
            <div className="text-center text-gray-400">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p>Memuat dokumen...</p>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && src && (
            isPdfMime(src.mime) ? (
              <iframe src={src.url} className="w-full h-[65vh] border-0" title={doc.nama_dokumen} />
            ) : isImageMime(src.mime) ? (
              <img src={src.url} alt={doc.nama_dokumen} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow" />
            ) : (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📄</p>
                <p className="text-gray-600 font-medium">{doc.file_name}</p>
                <p className="text-sm text-gray-400 mt-2 mb-6">Format ini tidak dapat ditampilkan langsung di browser</p>
                <button
                  onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >⬇ Download untuk Membuka</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

const PerangkatPage = () => {
  const [dokumen, setDokumen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [filterJenis, setFilterJenis] = useState('');

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
    try {
      await toast.promise(learningApi.uploadPerangkat(formData), {
        loading: 'Mengupload dokumen...',
        success: 'Dokumen berhasil diupload!',
        error: (e) => e?.response?.data?.message || 'Gagal mengupload dokumen',
      });
      setNamaDokumen(''); setJenisDokumen('RPP'); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchDokumen();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Hapus dokumen "${doc.nama_dokumen}"?`)) return;
    try {
      await toast.promise(learningApi.deletePerangkat(doc.id), {
        loading: 'Menghapus...', success: 'Dokumen berhasil dihapus', error: 'Gagal menghapus',
      });
      fetchDokumen();
    } catch {}
  };

  const filtered = filterJenis ? dokumen.filter(d => d.jenis_dokumen === filterJenis) : dokumen;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Perangkat Pembelajaran</h1>
        <p className="text-gray-500 mt-1">Upload, lihat, dan kelola dokumen perangkat pembelajaran</p>
      </div>

      {/* Form Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">📤 Upload Dokumen Baru</h2>
        <form onSubmit={handleUpload}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nama Dokumen</label>
              <input type="text" placeholder="Contoh: RPP Matematika Bab 1"
                value={namaDokumen} onChange={(e) => setNamaDokumen(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Jenis Dokumen</label>
              {/* Hanya RPP, Silabus, Modul */}
              <select value={jenisDokumen} onChange={(e) => setJenisDokumen(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                {JENIS_DOKUMEN.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">File (PDF/DOCX/Gambar)</label>
              <input type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                ref={fileRef} onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {uploading ? 'Mengupload...' : '⬆ Upload Dokumen'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter & List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">📁 Daftar Dokumen Terupload</h2>
          <div className="flex items-center gap-3">
            {/* Filter hanya RPP, Silabus, Modul */}
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Jenis</option>
              {JENIS_DOKUMEN.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filtered.length} FILE</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                <th className="px-6 py-3 text-left">File</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-800">{doc.nama_dokumen}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColor[doc.jenis_dokumen] || 'bg-gray-100 text-gray-600'}`}>
                      {doc.jenis_dokumen}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{doc.tanggal_upload}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs truncate max-w-[150px]">{doc.file_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setPreviewDoc(doc)} title="Lihat Dokumen"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                        👁 Lihat
                      </button>
                      <button onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)} title="Download"
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors">
                        ⬇ Unduh
                      </button>
                      <button onClick={() => handleDelete(doc)} title="Hapus"
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">
                        🗑 Hapus
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