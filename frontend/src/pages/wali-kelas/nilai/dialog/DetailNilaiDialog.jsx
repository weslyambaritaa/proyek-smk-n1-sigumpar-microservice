import { useEffect, useRef, useState } from 'react';

/**
 * DetailNilaiDialog
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - siswa: { id, nama_siswa, nilai: [{ nama_mapel, tugas, uas, uts, rata_rata }] }
 *  - filterSemester: string (opsional)
 *  - filterMapel: string (opsional)
 */
const DetailNilaiDialog = ({ isOpen, onClose, siswa, filterSemester, filterMapel }) => {
  if (!isOpen || !siswa) return null;

  // Filter nilai berdasarkan mapel jika ada filter aktif
  const nilaiData = (siswa.nilai || []).filter((n) => {
    if (filterMapel && n.nama_mapel !== filterMapel) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Detail Nilai – {siswa.nama_siswa}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Semester label */}
        <div className="px-6 pt-5">
          {filterSemester ? (
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Semester:{' '}
              <span className="text-blue-600">{filterSemester}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Semester: <span className="text-gray-400">Semua</span>
            </p>
          )}
        </div>

        {/* Tabel Nilai */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {nilaiData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">Tidak ada data nilai</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-center text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold text-left">Mapel</th>
                    <th className="px-4 py-3 font-semibold">Tugas</th>
                    <th className="px-4 py-3 font-semibold">UAS</th>
                    <th className="px-4 py-3 font-semibold">UTS</th>
                    <th className="px-4 py-3 font-semibold">Rata - rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nilaiData.map((n, idx) => (
                    <tr key={idx} className="text-center hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-left font-medium text-gray-800">
                        {n.nama_mapel}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{n.tugas ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{n.uas ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{n.uts ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            (n.rata_rata ?? 0) >= 75
                              ? 'text-green-600'
                              : 'text-red-500'
                          }`}
                        >
                          {n.rata_rata ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailNilaiDialog;