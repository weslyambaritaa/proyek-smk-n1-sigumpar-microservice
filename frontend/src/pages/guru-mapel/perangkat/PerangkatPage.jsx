import React, { useState, useEffect, useRef } from 'react';
import { learningApi } from '../../../api/learningApi';
import axiosInstance from '../../../api/axiosInstance';
import keycloak from '../../../keycloak';
import toast from 'react-hot-toast';

const JENIS_DOKUMEN = ['RPP', 'Silabus', 'Modul'];

const badgeColor = {
  RPP:     'bg-blue-100 text-blue-700',
  Silabus: 'bg-green-100 text-green-700',
  Modul:   'bg-purple-100 text-purple-700',
};

// Status review dari kepala sekolah
const STATUS_META = {
  menunggu:  { label: 'Menunggu Review', bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-400',  icon: '⏳' },
  disetujui: { label: 'Disetujui',       bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700',  dot: 'bg-green-500',  icon: '✅' },
  revisi:    { label: 'Perlu Revisi',    bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700',   dot: 'bg-blue-500',   icon: '🔄' },
  ditolak:   { label: 'Ditolak',         bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    dot: 'bg-red-500',    icon: '❌' },
};

const isImageMime = (mime) => mime && mime.startsWith('image/');
const isPdfMime   = (mime) => mime === 'application/pdf';

// ── Badge Status ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.menunggu;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.text} border ${meta.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.icon} {meta.label}
    </span>
  );
}

// ── Modal Preview Dokumen ─────────────────────────────────────────────────
function PreviewModal({ doc, onClose }) {
  const [src, setSrc]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!doc) return;
    setLoading(true); setError(null); setSrc(null);
    axiosInstance
      .get(`/api/learning/perangkat/${doc.id}/download`, { responseType: 'blob' })
      .then((res) => {
        const mime = res.headers['content-type'] || doc.file_mime || 'application/octet-stream';
        const blob = new Blob([res.data], { type: mime });
        setSrc({ url: URL.createObjectURL(blob), mime });
        setLoading(false);
      })
      .catch(() => { setError('Gagal memuat file'); setLoading(false); });
    return () => { if (src?.url) URL.revokeObjectURL(src.url); };
  }, [doc?.id]);

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{doc.nama_dokumen}</h2>
            <p className="text-xs text-gray-400">{doc.file_name} · {doc.jenis_dokumen}
              {doc.versi > 1 && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-semibold">Versi {doc.versi}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)}
              className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors">⬇ Download</button>
            <button onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors">✕ Tutup</button>
          </div>
        </div>
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
                <button onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">⬇ Download untuk membuka</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal Upload Revisi ──────────────────────────────────────────────────
function ModalUploadRevisi({ doc, onClose, onSuccess }) {
  const [file,       setFile]       = useState(null);
  const [nama,       setNama]       = useState(doc?.nama_dokumen || '');
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef();

  if (!doc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Pilih file revisi terlebih dahulu'); return; }

    const fd = new FormData();
    fd.append('nama_dokumen',  nama.trim() || doc.nama_dokumen);
    fd.append('jenis_dokumen', doc.jenis_dokumen);
    fd.append('file',          file);
    fd.append('parent_id',     doc.parent_id || doc.id); // rantai revisi ke dokumen root
    fd.append('nama_guru',     keycloak.tokenParsed?.name || '');

    setUploading(true);
    try {
      await axiosInstance.post('/api/learning/perangkat', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Revisi berhasil diunggah! Menunggu review ulang kepala sekolah.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah revisi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">Upload Revisi Dokumen</h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">📄 {doc.nama_dokumen}</p>
        </div>

        {/* Tampilkan catatan kepsek sebagai panduan revisi */}
        {doc.catatan_review && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Catatan dari Kepala Sekolah</p>
            <p className="text-sm text-blue-800 leading-relaxed">{doc.catatan_review}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Nama Dokumen
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama dokumen hasil revisi..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              File Revisi (PDF / DOCX / Gambar) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">Maks 20MB. Dokumen ini akan menggantikan versi sebelumnya.</p>
          </div>

          <div className="flex gap-3 pt-2 justify-end">
            <button type="button" onClick={onClose} disabled={uploading}
              className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors">
              {uploading ? 'Mengunggah...' : '⬆ Upload Revisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Halaman Utama ────────────────────────────────────────────────────────
const PerangkatPage = () => {
  const namaGuru = keycloak.tokenParsed?.name || 'Guru';

  const [dokumen,     setDokumen]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [previewDoc,  setPreviewDoc]  = useState(null);
  const [revisiDoc,   setRevisiDoc]   = useState(null); // modal upload revisi
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [namaDokumen,  setNamaDokumen]  = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('RPP');
  const [file,         setFile]         = useState(null);
  const fileRef = useRef();

  const fetchDokumen = async () => {
    setLoading(true);
    try {
      const res = await learningApi.getAllPerangkat();
      setDokumen(Array.isArray(res.data?.data) ? res.data.data : []);
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
    formData.append('nama_dokumen',  namaDokumen.trim());
    formData.append('jenis_dokumen', jenisDokumen);
    formData.append('file',          file);
    formData.append('nama_guru',     namaGuru);

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

  const filtered = dokumen.filter((d) => {
    if (filterJenis  && d.jenis_dokumen !== filterJenis)                             return false;
    if (filterStatus && (d.status_review || 'menunggu') !== filterStatus)            return false;
    return true;
  });

  // Hitung jumlah yang perlu direvisi
  const perluRevisi = dokumen.filter((d) => d.status_review === 'revisi' || d.status_review === 'ditolak').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {previewDoc && <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
      {revisiDoc  && <ModalUploadRevisi doc={revisiDoc} onClose={() => setRevisiDoc(null)} onSuccess={fetchDokumen} />}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Perangkat Pembelajaran</h1>
        <p className="text-gray-500 mt-1">Upload, lihat, dan kelola dokumen perangkat pembelajaran · {namaGuru}</p>
      </div>

      {/* Banner notifikasi jika ada yang perlu direvisi */}
      {perluRevisi > 0 && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="font-bold text-blue-800">
              {perluRevisi} dokumen memerlukan revisi atau perlu diunggah ulang
            </p>
            <p className="text-sm text-blue-600 mt-0.5">
              Silakan cek catatan dari kepala sekolah dan unggah dokumen yang sudah diperbaiki.
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('revisi')}
            className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shrink-0"
          >Lihat Sekarang</button>
        </div>
      )}

      {/* Form Upload Dokumen Baru */}
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

      {/* Daftar Dokumen */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-700">📁 Daftar Dokumen Terupload</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Jenis</option>
              {JENIS_DOKUMEN.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Semua Status</option>
              <option value="menunggu">⏳ Menunggu</option>
              <option value="disetujui">✅ Disetujui</option>
              <option value="revisi">🔄 Perlu Revisi</option>
              <option value="ditolak">❌ Ditolak</option>
            </select>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {filtered.length} FILE
            </span>
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
            <p>Belum ada dokumen yang sesuai filter</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3 text-left">Nama Dokumen</th>
                <th className="px-5 py-3 text-left">Jenis</th>
                <th className="px-5 py-3 text-left">Tgl Upload</th>
                <th className="px-5 py-3 text-center">Status Review</th>
                <th className="px-5 py-3 text-left">Catatan Kepsek</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((doc) => {
                const status = doc.status_review || 'menunggu';
                const perluRevisiItem = status === 'revisi' || status === 'ditolak';
                return (
                  <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${perluRevisiItem ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{doc.nama_dokumen}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{doc.file_name}</p>
                      {doc.versi > 1 && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-semibold mt-1 inline-block">
                          Versi {doc.versi}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${badgeColor[doc.jenis_dokumen] || 'bg-gray-100 text-gray-600'}`}>
                        {doc.jenis_dokumen}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{doc.tanggal_upload}</td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-5 py-4">
                      {doc.catatan_review ? (
                        <p className={`text-xs leading-relaxed max-w-[180px] line-clamp-2 ${
                          status === 'revisi' ? 'text-blue-700 font-medium' : status === 'ditolak' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {doc.catatan_review}
                        </p>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button onClick={() => setPreviewDoc(doc)} title="Lihat Dokumen"
                          className="px-2.5 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold transition-colors">
                          👁 Lihat
                        </button>
                        <button onClick={() => learningApi.downloadPerangkat(doc.id, doc.file_name)} title="Download"
                          className="px-2.5 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-semibold transition-colors">
                          ⬇
                        </button>
                        {/* Tombol upload revisi — muncul jika status revisi atau ditolak */}
                        {perluRevisiItem && (
                          <button onClick={() => setRevisiDoc(doc)} title="Upload Revisi"
                            className="px-2.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors">
                            🔄 Upload Revisi
                          </button>
                        )}
                        <button onClick={() => handleDelete(doc)} title="Hapus"
                          className="px-2.5 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition-colors">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PerangkatPage;