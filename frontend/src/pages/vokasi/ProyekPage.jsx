import React, { useState, useEffect, useRef } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

const StatusBadge = ({ value }) => {
  const map = {
    aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
    selesai: "bg-gray-100    text-gray-600    border-gray-200",
    dibatalkan: "bg-red-100     text-red-600     border-red-200",
  };
  const labels = {
    aktif: "Aktif",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] || "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {labels[value] || value}
    </span>
  );
};

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

const SelectField = ({ label, required, children, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {children}
    </select>
  </div>
);

// ── Modal Tambah / Edit Proyek ────────────────────────────
const ProyekDialog = ({ isOpen, onClose, onSaved, editData, programList }) => {
  const emptyForm = {
    judul_proyek: "",
    deskripsi: "",
    program_keahlian_id: "",
    tahun_ajaran: "2024/2025",
    semester: "ganjil",
    status: "aktif",
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(
      editData
        ? {
            judul_proyek: editData.judul_proyek || "",
            deskripsi: editData.deskripsi || "",
            program_keahlian_id: editData.program_keahlian_id || "",
            tahun_ajaran: editData.tahun_ajaran || "2024/2025",
            semester: editData.semester || "ganjil",
            status: editData.status || "aktif",
          }
        : emptyForm,
    );
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!form.judul_proyek) {
      toast.error("Judul proyek wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editData) {
        await vocationalApi.updateProyek(editData.id, form);
        toast.success("Proyek berhasil diperbarui");
      } else {
        await vocationalApi.createProyek(form);
        toast.success("Proyek berhasil dibuat");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal menyimpan proyek");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? "Edit Proyek" : "Tambah Proyek Vokasi"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <InputField
            label="Judul Proyek"
            required
            placeholder="Sistem Informasi Sekolah"
            value={form.judul_proyek}
            onChange={(e) => setForm({ ...form, judul_proyek: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Deskripsi
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi proyek..."
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          <SelectField
            label="Program Keahlian"
            value={form.program_keahlian_id}
            onChange={(e) =>
              setForm({ ...form, program_keahlian_id: e.target.value })
            }
          >
            <option value="">-- Pilih Program --</option>
            {programList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_program}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Tahun Ajaran"
              placeholder="2024/2025"
              value={form.tahun_ajaran}
              onChange={(e) =>
                setForm({ ...form, tahun_ajaran: e.target.value })
              }
            />
            <SelectField
              label="Semester"
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </SelectField>
          </div>
          {editData && (
            <SelectField
              label="Status Proyek"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </SelectField>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
          >
            {saving
              ? "Menyimpan..."
              : editData
                ? "Simpan Perubahan"
                : "Buat Proyek"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Detail Anggota ──────────────────────────────────
const AnggotaDialog = ({ isOpen, onClose, proyek }) => {
  const [anggotaList, setAnggotaList] = useState([]);
  const [form, setForm] = useState({
    nama_siswa: "",
    siswa_id: "",
    peran: "Anggota",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && proyek) fetchAnggota();
  }, [isOpen, proyek]);

  const fetchAnggota = async () => {
    setLoading(true);
    try {
      const res = await vocationalApi.getAnggotaProyek(proyek.id);
      setAnggotaList(res.data.data || []);
    } catch {
      toast.error("Gagal memuat anggota");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.nama_siswa) {
      toast.error("Nama siswa wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await vocationalApi.addAnggotaProyek(proyek.id, form);
      toast.success("Anggota berhasil ditambahkan");
      setForm({ nama_siswa: "", siswa_id: "", peran: "Anggota" });
      fetchAnggota();
    } catch {
      toast.error("Gagal menambahkan anggota");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (anggotaId) => {
    if (!window.confirm("Hapus anggota ini?")) return;
    try {
      await vocationalApi.deleteAnggotaProyek(anggotaId);
      toast.success("Anggota dihapus");
      fetchAnggota();
    } catch {
      toast.error("Gagal menghapus anggota");
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Anggota Proyek</h2>
            <p className="text-xs text-gray-500">{proyek?.judul_proyek}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Form tambah anggota */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Tambah Anggota
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Nama Siswa"
                required
                placeholder="Budi Santoso"
                value={form.nama_siswa}
                onChange={(e) =>
                  setForm({ ...form, nama_siswa: e.target.value })
                }
              />
              <InputField
                label="ID Siswa"
                placeholder="SIS001"
                value={form.siswa_id}
                onChange={(e) => setForm({ ...form, siswa_id: e.target.value })}
              />
            </div>
            <InputField
              label="Peran"
              placeholder="Ketua / Anggota"
              value={form.peran}
              onChange={(e) => setForm({ ...form, peran: e.target.value })}
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {saving ? "Menambahkan..." : "＋ Tambah Anggota"}
            </button>
          </div>

          {/* Daftar anggota */}
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-4">Memuat...</p>
          ) : anggotaList.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">
              Belum ada anggota
            </p>
          ) : (
            <div className="space-y-2">
              {anggotaList.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {a.nama_siswa}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.peran} {a.siswa_id ? `· ${a.siswa_id}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Halaman Utama Proyek ──────────────────────────────────
const ProyekPage = () => {
  const [proyekList, setProyekList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState({ type: null, data: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [proyekRes, progRes] = await Promise.all([
        vocationalApi.getAllProyek(),
        vocationalApi.getAllProgramKeahlian(),
      ]);
      setProyekList(proyekRes.data.data || []);
      setProgramList(progRes.data.data || []);
    } catch {
      toast.error("Gagal memuat data proyek");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const handleDelete = async (proyek) => {
    if (!window.confirm(`Hapus proyek "${proyek.judul_proyek}"?`)) return;
    try {
      await vocationalApi.deleteProyek(proyek.id);
      toast.success("Proyek dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus proyek");
    }
  };

  const filtered = proyekList.filter(
    (p) =>
      !search ||
      p.judul_proyek.toLowerCase().includes(search.toLowerCase()) ||
      (p.nama_program || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Proyek Vokasi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {proyekList.length} total proyek
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "tambah", data: null })}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          ＋ Tambah Proyek
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Cari proyek..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              Tidak ada proyek ditemukan
            </div>
          ) : (
            filtered.map((proyek) => (
              <div
                key={proyek.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge value={proyek.status} />
                  <div
                    className="relative"
                    ref={openMenuId === proyek.id ? menuRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === proyek.id ? null : proyek.id,
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                      ⋮
                    </button>
                    {openMenuId === proyek.id && (
                      <div className="absolute right-0 top-8 z-30 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-1 text-sm">
                        <button
                          onClick={() => {
                            setDialog({ type: "edit", data: proyek });
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            setDialog({ type: "anggota", data: proyek });
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                        >
                          👥 Anggota
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            handleDelete(proyek);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 text-base leading-snug mb-2">
                  {proyek.judul_proyek}
                </h3>
                {proyek.deskripsi && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {proyek.deskripsi}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-gray-500">
                  {proyek.nama_program && <p>🏫 {proyek.nama_program}</p>}
                  <p>
                    📅 {proyek.tahun_ajaran} · Semester {proyek.semester}
                  </p>
                  <p>👥 {proyek.jumlah_anggota} anggota</p>
                  {proyek.nama_guru && <p>👨‍🏫 {proyek.nama_guru}</p>}
                </div>

                <button
                  onClick={() => setDialog({ type: "anggota", data: proyek })}
                  className="mt-4 w-full text-center text-xs font-semibold text-purple-600 hover:text-purple-700 py-2 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                >
                  Lihat & Kelola Anggota →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <ProyekDialog
        isOpen={dialog.type === "tambah" || dialog.type === "edit"}
        onClose={() => setDialog({ type: null, data: null })}
        onSaved={fetchData}
        editData={dialog.type === "edit" ? dialog.data : null}
        programList={programList}
      />
      <AnggotaDialog
        isOpen={dialog.type === "anggota"}
        onClose={() => setDialog({ type: null, data: null })}
        proyek={dialog.data}
      />
    </div>
  );
};

export default ProyekPage;
