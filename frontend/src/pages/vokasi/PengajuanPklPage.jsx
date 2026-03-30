import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vocationApi } from "../../api/vocationApi";
import { usePklSubmissions } from "../../hooks/usePklSubmissions";

const statusBadge = (status) => {
  const map = {
    approved: "bg-green-100 text-green-700",
    pending:  "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status ?? "pending"}
    </span>
  );
};

const PengajuanPklPage = () => {
  const { data, loading, error, load } = usePklSubmissions();
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    load();
  }, [load]);

  const handleValidate = (submission) => {
    setOpenMenuId(null);
    const promise = vocationApi.validateSubmission(submission.id, {
      status_validasi: "validated",
      keterangan_layak: "Disetujui oleh guru vokasi",
    });
    toast.promise(promise, {
      loading: "Memvalidasi pengajuan...",
      success: "Pengajuan berhasil divalidasi!",
      error: "Gagal memvalidasi pengajuan.",
    }).then(() => load());
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengajuan PKL Siswa</h1>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">Memuat data...</div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
          Gagal memuat data. Pastikan vocational-service berjalan.
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Nama Perusahaan</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Status Persetujuan</th>
                <th className="px-6 py-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    Belum ada pengajuan PKL.
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{row.nama_lengkap ?? row.siswa_id}</td>
                  <td className="px-6 py-4">{row.nama_perusahaan}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{row.alamat}</td>
                  <td className="px-6 py-4">{statusBadge(row.status_persetujuan)}</td>
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                      className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-bold text-lg">⋮</span>
                    </button>

                    {openMenuId === row.id && (
                      <div className="absolute right-6 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                        <div className="py-1">
                          <button
                            onClick={() => handleValidate(row)}
                            disabled={row.status_persetujuan === "approved"}
                            className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <span>✔</span> Validasi
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PengajuanPklPage;
