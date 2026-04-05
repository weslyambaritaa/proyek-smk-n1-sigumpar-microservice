import { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import ProgramKerjaDialog from "./dialog/ProgramKerjaDialog";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  belum_mulai:     { label: "Belum Mulai",     cls: "bg-gray-100 text-gray-600 border border-gray-200",   icon: "⏳" },
  sedang_berjalan: { label: "Sedang Berjalan",  cls: "bg-blue-100 text-blue-700 border border-blue-200",   icon: "🔄" },
  selesai:         { label: "Selesai",           cls: "bg-green-100 text-green-700 border border-green-200", icon: "✅" },
  ditunda:         { label: "Ditunda",           cls: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: "⚠️" },
};

const BIDANG_COLOR = {
  "Kurikulum":          "bg-blue-100 text-blue-700",
  "Kesiswaan":          "bg-purple-100 text-purple-700",
  "Sarana & Prasarana": "bg-green-100 text-green-700",
  "Humas":              "bg-pink-100 text-pink-700",
  "Lainnya":            "bg-gray-100 text-gray-600",
};

export default function ProgramKerjaPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBidang, setFilterBidang] = useState("");
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await academicApi.getAllProgramKerja();
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data program kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleDelete = async () => {
    try {
      await academicApi.deleteProgramKerja(itemToDelete.id);
      toast.success("Program kerja berhasil dihapus!");
      fetchData();
      setIsDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus program kerja.");
    }
  };

  const filtered = data.filter(d =>
    (!filterStatus || d.status === filterStatus) &&
    (!filterBidang || d.bidang === filterBidang)
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📌</span>
            <h1 className="text-2xl font-bold text-gray-800">Program Kerja</h1>
          </div>
          <p className="text-sm text-gray-500">Manajemen program kerja Wakil Kepala Sekolah</p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }} className="bg-orange-600 hover:bg-orange-700">
          + Tambah Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{cfg.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {data.filter(d => d.status === key).length}
                </p>
              </div>
              <span className="text-2xl">{cfg.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          value={filterBidang}
          onChange={(e) => setFilterBidang(e.target.value)}
        >
          <option value="">Semua Bidang</option>
          {["Kurikulum", "Kesiswaan", "Sarana & Prasarana", "Humas", "Lainnya"].map(b => <option key={b}>{b}</option>)}
        </select>
        {(filterStatus || filterBidang) && (
          <button
            onClick={() => { setFilterStatus(""); setFilterBidang(""); }}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">📌</p>
            <p className="font-medium">{filterStatus || filterBidang ? "Tidak ada program yang cocok" : "Belum ada program kerja"}</p>
            {!filterStatus && !filterBidang && <p className="text-sm mt-1">Klik "Tambah Program" untuk menambahkan</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">Nama Program</th>
                <th className="px-6 py-3 text-center">Bidang</th>
                <th className="px-6 py-3 text-left">Periode</th>
                <th className="px-6 py-3 text-left">PJ</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item, i) => {
                const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.belum_mulai;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{item.nama_program}</p>
                      {item.deskripsi && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.deskripsi}</p>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${BIDANG_COLOR[item.bidang] || BIDANG_COLOR["Lainnya"]}`}>
                        {item.bidang}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <p>{formatDate(item.tanggal_mulai)}</p>
                      {item.tanggal_selesai && <p className="text-gray-400">s/d {formatDate(item.tanggal_selesai)}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.penanggung_jawab || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative" ref={openMenuId === item.id ? menuRef : null}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                      >
                        <span className="font-bold text-lg">⋮</span>
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-6 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                          <div className="py-1">
                            <button
                              onClick={() => { setSelectedItem(item); setIsDialogOpen(true); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => { setItemToDelete(item); setIsDeleteOpen(true); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 border-t border-gray-100"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {data.length} program kerja
          </div>
        )}
      </div>

      <ProgramKerjaDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchData}
        selectedItem={selectedItem}
      />

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Hapus Program Kerja</h3>
            <p className="text-sm text-gray-600 mb-4">
              Yakin ingin menghapus program <strong>{itemToDelete?.nama_program}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
