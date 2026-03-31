import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DetailPengumuman = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const pengumuman = state?.pengumuman;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (!pengumuman) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200 mt-6 max-w-2xl mx-auto">
        <p className="text-gray-500 mb-4 text-lg">Data pengumuman tidak ditemukan atau halaman telah di-refresh.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 px-3 py-1.5 rounded-lg w-fit"
      >
        <span className="mr-2">&larr;</span> Kembali
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Detail Pengumuman */}
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {pengumuman.kategori || 'INFORMASI'}
            </span>
            {/* Ikon jam sudah dihapus di sini */}
            <span className="text-sm text-gray-500 font-medium">
              {formatDate(pengumuman.created_at || pengumuman.tanggal)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
            {pengumuman.judul}
          </h1>
          <p className="text-gray-600 text-sm">
            Diterbitkan oleh: <span className="font-semibold text-gray-700">{pengumuman.pembuat || 'Admin'}</span>
          </p>
        </div>
        
        {/* Isi Pengumuman */}
        <div className="p-8">
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
            {pengumuman.isi || pengumuman.deskripsi}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPengumuman;