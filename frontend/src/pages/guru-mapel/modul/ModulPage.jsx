import React, { useState, useEffect, useRef } from 'react';
import { learningApi } from '../../../api/learningApi';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import keycloak from '../../../keycloak';

const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const ModulPage = () => {
  const guruId = keycloak.tokenParsed?.sub;
  const isKepsek = keycloak.hasRealmRole?.('kepala-sekolah');

  const [data, setData] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRevisiOpen, setIsRevisiOpen] = useState(false);
  const [selectedModul, setSelectedModul] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    nama_modul: '', mata_pelajaran_id: '',
    bulan: '', tahun: new Date().getFullYear().toString(),
    nama_file: '', file_url: '', status_upload: '',
  });
  const [reviewForm, setReviewForm] = useState({ action: '', catatan_revisi: '' });
  const [revisiForm, setRevisiForm] = useState({ nama_file: '', file_url: '', status_upload: '' });

  const fetchData = async () => {
    try {
      const params = isKepsek ? {} : { guru_id: guruId };
      const res = await learningApi.getAllModul(params);
      setData(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    if (!isKepsek) {
      learningApi.getMapelByGuru(guruId)
        .then(res => setMapelList(res.data.data || []))
        .catch(() => {});
    }
  }, []);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) { toast.error('Format tidak didukung. Gunakan PDF/DOCX.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Ukuran file maks. 10 MB!'); return; }
    setter(prev => ({ ...prev, nama_file: file.name, file_url: `/uploads/${file.name}` }));
  };

  const handleUpload = async () => {
    const { nama_modul, bulan, tahun, nama_file, status_upload } = uploadForm;
    if (!nama_modul || !bulan || !tahun || !nama_file) {
      toast.error('Lengkapi semua field!'); return;
    }
    if (!status_upload) { toast.error('Pilih status unggahan!'); return; }

    const promise = learningApi.uploadModul({ ...uploadForm, guru_id: guruId });
    toast.promise(promise, {
      loading: 'Mengunggah modul...',
      success: status_upload === 'Selesai' ? 'Modul berhasil diunggah ke Kepala Sekolah!' : 'Unggahan dibatalkan.',
      error: 'Gagal mengunggah modul.',
    }).then(() => {
      setIsUploadOpen(false);
      setUploadForm({ nama_modul: '', mata_pelajaran_id: '', bulan: '', tahun: new Date().getFullYear().toString(), nama_file: '', file_url: '', status_upload: '' });
      fetchData();
    }).catch(() => {});
  };

  const handleReview = async () => {
    if (!reviewForm.action) { toast.error('Pilih keputusan!'); return; }
    if (reviewForm.action === 'tolak' && !reviewForm.catatan_revisi) {
      toast.error('Catatan revisi wajib diisi!'); return;
    }
    const promise = learningApi.reviewModul(selectedModul.id, { ...reviewForm, reviewer_id: guruId });
    toast.promise(promise, {
      loading: 'Memproses...', success: 'Keputusan berhasil dikirim!', error: 'Gagal.'
    }).then(() => { setIsReviewOpen(false); fetchData(); }).catch(() => {});
  };

  const handleRevisi = async () => {
    if (!revisiForm.nama_file) { toast.error('Pilih file revisi!'); return; }
    if (!revisiForm.status_upload) { toast.error('Pilih status unggahan!'); return; }
    const promise = learningApi.revisiModul(selectedModul.id, revisiForm);
    toast.promise(promise, {
      loading: 'Mengunggah revisi...', success: 'Revisi berhasil dikirim!', error: 'Gagal.'
    }).then(() => { setIsRevisiOpen(false); fetchData(); }).catch(() => {});
  };

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isKepsek ? 'Review Modul Ajar' : 'Upload Modul Per Bulan'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isKepsek
              ? 'Tinjau dan setujui modul ajar yang diunggah guru'
              : 'Kelola modul ajar bulanan untuk setiap mata pelajaran'}
          </p>
        </div>
        {!isKepsek && (
          <Button onClick={() => setIsUploadOpen(true)}>+ Upload Modul</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Modul</th>
              <th className="px-6 py-4">Mata Pelajaran</th>
              <th className="px-6 py-4">Periode</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Catatan</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Belum ada modul</td></tr>
            ) : (
              data.map(modul => (
                <tr key={modul.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800 text-sm">{modul.nama_modul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{modul.nama_file}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{modul.nama_mapel || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {NAMA_BULAN[modul.bulan]} {modul.tahun}
                    </span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={modul.status} /></td>
                  <td className="px-6 py-4 text-sm max-w-xs">
                    {modul.catatan_revisi
                      ? <span className="text-red-600 italic">"{modul.catatan_revisi}"</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    {isKepsek && modul.status === 'Menunggu Review' && (
                      <button
                        onClick={() => { setSelectedModul(modul); setReviewForm({ action: '', catatan_revisi: '' }); setIsReviewOpen(true); }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >Tinjau</button>
                    )}
                    {!isKepsek && modul.status === 'Perlu Direvisi' && (
                      <button
                        onClick={() => { setSelectedModul(modul); setRevisiForm({ nama_file: '', file_url: '', status_upload: '' }); setIsRevisiOpen(true); }}
                        className="text-orange-600 hover:underline text-sm font-medium"
                      >Revisi</button>
                    )}
                    {!isKepsek && (
                      <button
                        onClick={() => toast.promise(learningApi.deleteModul(modul.id), {
                          loading: 'Menghapus...', success: 'Berhasil!', error: 'Gagal.'
                        }).then(fetchData).catch(() => {})}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >Hapus</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === SHEET UPLOAD === */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Upload Modul</h2>
              <p className="text-sm text-gray-500 mt-1">Unggah modul ajar per bulan</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Modul <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-3 py-2.5 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  placeholder="Contoh: Modul Sistem Bilangan Biner"
                  value={uploadForm.nama_modul}
                  onChange={e => setUploadForm({ ...uploadForm, nama_modul: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Pelajaran</label>
                <select className="w-full px-3 py-2.5 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                  value={uploadForm.mata_pelajaran_id}
                  onChange={e => setUploadForm({ ...uploadForm, mata_pelajaran_id: e.target.value })}>
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {mapelList.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bulan <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2.5 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                    value={uploadForm.bulan}
                    onChange={e => setUploadForm({ ...uploadForm, bulan: e.target.value })}>
                    <option value="">-- Pilih --</option>
                    {NAMA_BULAN.slice(1).map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2.5 border rounded-lg focus:ring focus:ring-blue-200 text-sm"
                    value={uploadForm.tahun}
                    onChange={e => setUploadForm({ ...uploadForm, tahun: e.target.value })}>
                    {tahunOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File Modul <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onClick={() => document.getElementById('modul-file')?.click()}>
                  <input id="modul-file" type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => handleFileChange(e, setUploadForm)} />
                  {uploadForm.nama_file ? (
                    <div className="text-blue-600">
                      <p className="text-xl mb-1">📄</p>
                      <p className="font-medium text-sm">{uploadForm.nama_file}</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-2xl mb-1">☁️</p>
                      <p className="text-sm">Klik untuk pilih file (PDF/DOCX, maks 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Unggahan <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {['Selesai', 'Belum Selesai'].map(s => (
                    <button key={s} onClick={() => setUploadForm({ ...uploadForm, status_upload: s })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                        ${uploadForm.status_upload === s
                          ? s === 'Selesai' ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                      {s === 'Selesai' ? '✅ Selesai' : '❌ Belum Selesai'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>Batal</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* === SHEET REVIEW (KEPSEK) === */}
      {isReviewOpen && selectedModul && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Tinjau Modul</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Modul:</span><span className="font-semibold">{selectedModul.nama_modul}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Periode:</span><span>{NAMA_BULAN[selectedModul.bulan]} {selectedModul.tahun}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">File:</span><span className="text-blue-600">{selectedModul.nama_file}</span></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Keputusan <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {[{val:'approve',label:'✅ Setujui',ac:'bg-green-600 text-white border-green-600'},{val:'tolak',label:'❌ Tolak',ac:'bg-red-500 text-white border-red-500'}].map(opt=>(
                    <button key={opt.val} onClick={() => setReviewForm({ ...reviewForm, action: opt.val })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${reviewForm.action===opt.val?opt.ac:'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {reviewForm.action === 'tolak' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Revisi <span className="text-red-500">*</span></label>
                  <textarea rows={4} className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200 text-sm resize-none"
                    placeholder="Tuliskan catatan perbaikan..."
                    value={reviewForm.catatan_revisi}
                    onChange={e => setReviewForm({ ...reviewForm, catatan_revisi: e.target.value })} />
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsReviewOpen(false)}>Batal</Button>
              <Button onClick={handleReview}>Kirim Keputusan</Button>
            </div>
          </div>
        </div>
      )}

      {/* === SHEET REVISI (GURU) === */}
      {isRevisiOpen && selectedModul && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-orange-600">Upload Revisi Modul</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {selectedModul.catatan_revisi && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-1">📋 Catatan dari Kepala Sekolah:</p>
                  <p className="text-sm text-red-800 italic">"{selectedModul.catatan_revisi}"</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">File Revisi <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-5 text-center cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => document.getElementById('revisi-modul-file')?.click()}>
                  <input id="revisi-modul-file" type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={e => handleFileChange(e, setRevisiForm)} />
                  {revisiForm.nama_file ? (
                    <div className="text-orange-600"><p className="text-xl mb-1">📄</p><p className="text-sm font-medium">{revisiForm.nama_file}</p></div>
                  ) : (
                    <div className="text-gray-400"><p className="text-2xl mb-1">☁️</p><p className="text-sm">Klik untuk pilih file revisi</p></div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {['Selesai','Belum Selesai'].map(s=>(
                    <button key={s} onClick={() => setRevisiForm({ ...revisiForm, status_upload: s })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                        ${revisiForm.status_upload===s ? s==='Selesai'?'bg-blue-600 text-white border-blue-600':'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                      {s==='Selesai'?'✅ Selesai':'❌ Belum Selesai'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsRevisiOpen(false)}>Batal</Button>
              <Button onClick={handleRevisi}>Upload Revisi</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulPage;
