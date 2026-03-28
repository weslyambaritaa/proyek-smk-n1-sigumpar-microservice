const DetailNilaiModal = ({ siswa, onClose }) => {
  if (!siswa) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Detail Nilai - {siswa.namaSiswa}
            </h2>
            <p className="text-sm font-semibold text-gray-600 mt-1">
              Semester: {siswa.semester}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Tabel nilai per mapel */}
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Mapel</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">Tugas</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">UAS</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">UTS</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Rata - rata</th>
                </tr>
              </thead>
              <tbody>
                {(siswa.nilaiMapel || []).map((mapel, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{mapel.mataPelajaran}</td>
                    <td className="px-4 py-3 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{mapel.nilaiHarian}</td>
                    <td className="px-4 py-3 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{mapel.nilaiUAS}</td>
                    <td className="px-4 py-3 text-center font-bold text-sm text-gray-800 border-r border-gray-200">{mapel.nilaiUTS}</td>
                    <td className="px-4 py-3 text-center font-bold text-sm text-gray-800">{mapel.nilaiAkhir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ringkasan */}
          <div className="mt-4 flex justify-between items-center px-2">
            <span className="text-sm text-gray-500">
              Keterangan: <span className={`font-semibold ${siswa.keterangan === 'Naik Kelas' ? 'text-green-600' : 'text-red-600'}`}>{siswa.keterangan}</span>
            </span>
            <span className="text-sm text-gray-500">
              Rata-rata Keseluruhan: <span className="font-bold text-gray-800">{siswa.rataRata}</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailNilaiModal;