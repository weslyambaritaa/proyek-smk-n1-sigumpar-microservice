import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { learningApi } from "../../../api/learningApi";
import toast from "react-hot-toast";

// Modal Konfirmasi Hapus
function ModalHapus({ onConfirm, onCancel, namaMapel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-bold text-gray-800 mb-2">
          Hapus Perangkat
        </h3>
        <p className="text-sm text-gray-600 mb-5">
          Yakin ingin menghapus perangkat{" "}
          <span className="font-semibold text-gray-800">"{namaMapel}"</span>?
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Lihat Detail File
function ModalLihat({ item, onClose }) {
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-base font-bold text-gray-800 mb-4">
          Detail Perangkat — {item.namaMapel} ({item.kelas})
        </h3>
        <div className="space-y-3 text-sm">
          <FileRow label="Silabus" url={item.uploadSilabus} base={BASE} />
          <FileRow label="RPP" url={item.uploadRPP} base={BASE} />
          <FileRow label="Modul Ajar" url={item.modulAjar} base={BASE} />
        </div>
        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function FileRow({ label, url, base }) {
  if (!url)
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-gray-500">{label}</span>
        <span className="text-red-400 text-xs">Belum diupload</span>
      </div>
    );
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-gray-700 font-medium">{label}</span>
      
        href={`${base}${url}`}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 hover:underline text-xs"
      >
        Lihat / Unduh ↗
      </a>
    </div>
  );
}

export default function DetailPembelajaranPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalHapus, setModalHapus] = useState(null); // { id, namaMapel }
  const [modalLihat, setModalLihat] = useState(null); // item

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await learningApi.getDetailGuru(userId);
      setData(res.data);
    } catch (err) {
      toast.error("Gagal memuat detail guru");
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = async () => {
    try {
      await learningApi.deletePerangkat(modalHapus.id);
      toast.success("Perangkat berhasil dihapus");
      setModalHapus(null);
      fetchDetail();
    } catch (err) {
      toast.error("Gagal menghapus perangkat");
      setModalHapus(null);
    }
  };

  const statusLengkap = (item) =>
    item.uploadSilabus && item.uploadRPP && item.modulAjar;

  return (
    <div>
      {modalHapus && (
        <ModalHapus
          namaMapel={modalHapus.namaMapel}
          onConfirm={handleHapus}
          onCancel={() => setModalHapus(null)}
        />
      )}
      {modalLihat && (
        <ModalLihat item={modalLihat} onClose={() => setModalLihat(null)} />
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Sistem Pengecekan Perangkat Pembelajaran
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-700 text-sm mr-2"
          >
            ← Kembali
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            Detail Perangkat Pembelajaran Guru
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Memuat data...
          </div>
        ) : !data ? null : (
          <>
            {/* Info guru */}
            <div className="flex items-center gap-3 mb-6 mt-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-3xl">👤</span>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">User ID:</span>{" "}
                  <span className="font-mono text-xs">{data.user_id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Status Kelengkapan:</span>{" "}
                  <span
                    className={
                      data.status_kelengkapan === "Lengkap"
                        ? "text-green-600 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {data.status_kelengkapan}
                  </span>
                </p>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-800 mb-3">
              Daftar Perangkat Pembelajaran
            </h3>

            {/* Header tabel */}
            <div className="grid grid-cols-4 bg-blue-50 rounded px-4 py-2.5 text-sm font-semibold text-gray-700 mb-1">
              <span>Nama Mapel</span>
              <span>Kelas</span>
              <span>Status</span>
              <span className="text-right">Aksi</span>
            </div>

            {data.data.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Belum ada perangkat pembelajaran
              </div>
            ) : (
              data.data.map((item) => {
                const lengkap = statusLengkap(item);
                return (
                  <div
                    key={item.id_perangkatPembelajaran}
                    className="grid grid-cols-4 px-4 py-3 border-b border-gray-100 text-sm items-center"
                  >
                    <span className="text-gray-700">{item.namaMapel}</span>
                    <span className="text-gray-600">{item.kelas}</span>
                    <span
                      className={
                        lengkap
                          ? "text-green-600 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {lengkap ? "Lengkap" : "Belum Lengkap"}
                    </span>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setModalLihat(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() =>
                          setModalHapus({
                            id: item.id_perangkatPembelajaran,
                            namaMapel: item.namaMapel,
                          })
                        }
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}