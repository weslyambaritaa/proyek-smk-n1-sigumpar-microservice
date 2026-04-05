import { useState, useEffect, useRef } from "react";
import { academicApi } from "../../../api/academicApi";
import SupervisiDialog from "./dialog/SupervisiDialog";
import Button from "../../../components/ui/Button";
import toast from "react-hot-toast";

const getNilaiColor = (nilai) => {
  if (!nilai) return "text-gray-400";
  if (nilai >= 85) return "text-green-600 font-bold";
  if (nilai >= 70) return "text-yellow-600 font-bold";
  return "text-red-600 font-bold";
};

const getNilaiBadge = (nilai) => {
  if (!nilai) return { label: "—", cls: "bg-gray-100 text-gray-400" };
  if (nilai >= 85) return { label: "Sangat Baik", cls: "bg-green-100 text-green-700" };
  if (nilai >= 70) return { label: "Baik", cls: "bg-yellow-100 text-yellow-700" };
  return { label: "Perlu Perbaikan", cls: "bg-red-100 text-red-700" };
};

export default function SupervisiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await academicApi.getAllSupervisi();
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Gagal memuat data supervisi");
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
      await academicApi.deleteSupervisi(itemToDelete.id);
      toast.success("Data supervisi berhasil dihapus!");
      fetchData();
      setIsDeleteOpen(false);
    } catch {
      toast.error("Gagal menghapus data.");
    }
  };

  const filtered = data.filter(d =>
    d.nama_guru?.toLowerCase().includes(search.toLowerCase()) ||
    d.kelas?.toLowerCase().includes(search.toLowerCase()) ||
    d.mata_pelajaran?.toLowerCase().includes(search.toLowerCase())
  );

  const avgNilai = data.length
    ? (data.reduce((s, d) => s + (parseFloat(d.nilai) || 0), 0) / data.length).toFixed(1)
    : "—";

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl font-bold text-gray-800">Supervisi Guru</h1>
          </div>
          <p className="text-sm text-gray-500">Pencatatan hasil kunjungan & supervisi pembelajaran di kelas</p>
        </div>
        <Button onClick={() => { setSelectedItem(null); setIsDialogOpen(true); }} className="bg-orange-600 hover:bg-orange-700">
          + Tambah Supervisi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Supervisi", value: data.length, icon: "📋", color: "blue" },
          { label: "Rata-rata Nilai", value: avgNilai, icon: "⭐", color: "yellow" },
          {
            label: "Guru Disupervisi",
            value: new Set(data.map(d => d.guru_id)).size,
            icon: "👨‍🏫", color: "orange"
          },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama guru, kelas, atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          />
        </div>
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
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-medium">{search ? "Tidak ada hasil" : "Belum ada data supervisi"}</p>
            {!search && <p className="text-sm mt-1">Klik "Tambah Supervisi" untuk mencatat hasil supervisi</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">No</th>
                <th className="px-6 py-3 text-left">Guru</th>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Kelas / Mapel</th>
                <th className="px-6 py-3 text-center">Nilai</th>
                <th className="px-6 py-3 text-center">Predikat</th>
                <th className="px-6 py-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item, i) => {
                const badge = getNilaiBadge(item.nilai);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-700 text-xs font-bold">{item.nama_guru?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.nama_guru}</p>
                          <p className="text-xs text-gray-400">{item.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 font-medium">{item.kelas || "—"}</p>
                      <p className="text-xs text-gray-400">{item.mata_pelajaran || "—"}</p>
                    </td>
                    <td className={`px-6 py-4 text-center text-base ${getNilaiColor(item.nilai)}`}>
                      {item.nilai || "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
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
            Menampilkan {filtered.length} dari {data.length} data supervisi
          </div>
        )}
      </div>

      <SupervisiDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchData}
        selectedItem={selectedItem}
      />

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-2">Hapus Data Supervisi</h3>
            <p className="text-sm text-gray-600 mb-4">
              Yakin ingin menghapus data supervisi <strong>{itemToDelete?.nama_guru}</strong> pada tanggal {itemToDelete?.tanggal ? new Date(itemToDelete.tanggal).toLocaleDateString("id-ID") : "—"}?
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
