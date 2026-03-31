import React, { useState, useEffect, useRef } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────
const StatusBadge = ({ value, type = "approval" }) => {
  const approvalMap = {
    disetujui: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100  text-amber-700  border-amber-200",
    ditolak: "bg-red-100    text-red-700    border-red-200",
  };
  const kelayakanMap = {
    layak: "bg-blue-100 text-blue-700 border-blue-200",
    tidak_layak: "bg-red-100  text-red-700  border-red-200",
    belum_dinilai: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const map = type === "approval" ? approvalMap : kelayakanMap;
  const labels = {
    disetujui: "Disetujui",
    pending: "Pending",
    ditolak: "Ditolak",
    layak: "Layak",
    tidak_layak: "Tidak Layak",
    belum_dinilai: "Belum Dinilai",
  };
  const cls = map[value] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {labels[value] || value}
    </span>
  );
};

const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-red-400"}`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-500 w-8 text-right">
      {value}%
    </span>
  </div>
);

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {children}
    </select>
  </div>
);

// ── Modal Tambah / Edit PKL ───────────────────────────────
const PKLDialog = ({ isOpen, onClose, onSaved, editData, programList }) => {
  const emptyForm = {
    siswa_id: "",
    nama_siswa: "",
    kelas: "",
    program_keahlian_id: "",
    nama_perusahaan: "",
    alamat_perusahaan: "",
    kontak_perusahaan: "",
    bidang_pekerjaan: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        siswa_id: editData.siswa_id || "",
        nama_siswa: editData.nama_siswa || "",
        kelas: editData.kelas || "",
        program_keahlian_id: editData.program_keahlian_id || "",
        nama_perusahaan: editData.nama_perusahaan || "",
        alamat_perusahaan: editData.alamat_perusahaan || "",
        kontak_perusahaan: editData.kontak_perusahaan || "",
        bidang_pekerjaan: editData.bidang_pekerjaan || "",
        tanggal_mulai: editData.tanggal_mulai
          ? editData.tanggal_mulai.split("T")[0]
          : "",
        tanggal_selesai: editData.tanggal_selesai
          ? editData.tanggal_selesai.split("T")[0]
          : "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!form.nama_siswa || !form.nama_perusahaan) {
      toast.error("Nama siswa dan nama perusahaan wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editData) {
        await vocationalApi.updatePKL(editData.id, form);
        toast.success("Data PKL berhasil diperbarui");
      } else {
        await vocationalApi.createPKL(form);
        toast.success("Data PKL berhasil ditambahkan");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Gagal menyimpan data PKL");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? "Edit Data PKL" : "Tambah Pengajuan PKL"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="ID Siswa"
              placeholder="SIS001"
              value={form.siswa_id}
              onChange={(e) => setForm({ ...form, siswa_id: e.target.value })}
            />
            <InputField
              label="Nama Siswa"
              required
              placeholder="Budi Santoso"
              value={form.nama_siswa}
              onChange={(e) => setForm({ ...form, nama_siswa: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Kelas"
              placeholder="XII TKJ 1"
              value={form.kelas}
              onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            />
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
          </div>
          <InputField
            label="Nama Perusahaan"
            required
            placeholder="PT. Maju Bersama"
            value={form.nama_perusahaan}
            onChange={(e) =>
              setForm({ ...form, nama_perusahaan: e.target.value })
            }
          />
          <InputField
            label="Alamat Perusahaan"
            placeholder="Jl. Sudirman No. 10, Balige"
            value={form.alamat_perusahaan}
            onChange={(e) =>
              setForm({ ...form, alamat_perusahaan: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Kontak Perusahaan"
              placeholder="0812-xxxx-xxxx"
              value={form.kontak_perusahaan}
              onChange={(e) =>
                setForm({ ...form, kontak_perusahaan: e.target.value })
              }
            />
            <InputField
              label="Bidang Pekerjaan"
              placeholder="Teknisi Jaringan"
              value={form.bidang_pekerjaan}
              onChange={(e) =>
                setForm({ ...form, bidang_pekerjaan: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              type="date"
              label="Tanggal Mulai"
              value={form.tanggal_mulai}
              onChange={(e) =>
                setForm({ ...form, tanggal_mulai: e.target.value })
              }
            />
            <InputField
              type="date"
              label="Tanggal Selesai"
              value={form.tanggal_selesai}
              onChange={(e) =>
                setForm({ ...form, tanggal_selesai: e.target.value })
              }
            />
          </div>
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
          >
            {saving
              ? "Menyimpan..."
              : editData
                ? "Simpan Perubahan"
                : "Tambah PKL"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Validasi / Approve ──────────────────────────────
const ValidasiDialog = ({ isOpen, onClose, onSaved, pklData }) => {
  const [form, setForm] = useState({
    status_kelayakan: "layak",
    status_approval: "disetujui",
    catatan_guru: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vocationalApi.approvePKL({ pkl_id: pklData.id, ...form });
      toast.success("Status PKL berhasil diperbarui");
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Validasi PKL</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              Siswa:{" "}
              <span className="font-semibold text-gray-900">
                {pklData?.nama_siswa}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Perusahaan:{" "}
              <span className="font-semibold text-gray-900">
                {pklData?.nama_perusahaan}
              </span>
            </p>
          </div>
          <SelectField
            label="Kelayakan Tempat PKL"
            value={form.status_kelayakan}
            onChange={(e) =>
              setForm({ ...form, status_kelayakan: e.target.value })
            }
          >
            <option value="layak">✅ Layak</option>
            <option value="tidak_layak">❌ Tidak Layak</option>
            <option value="belum_dinilai">⏳ Belum Dinilai</option>
          </SelectField>
          <SelectField
            label="Status Persetujuan"
            value={form.status_approval}
            onChange={(e) =>
              setForm({ ...form, status_approval: e.target.value })
            }
          >
            <option value="disetujui">✅ Disetujui</option>
            <option value="pending">⏳ Pending</option>
            <option value="ditolak">❌ Ditolak</option>
          </SelectField>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Catatan Guru
            </label>
            <textarea
              rows={3}
              placeholder="Masukkan alasan atau catatan..."
              value={form.catatan_guru}
              onChange={(e) =>
                setForm({ ...form, catatan_guru: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Keputusan"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Monitoring ──────────────────────────────────────
const MonitoringDialog = ({ isOpen, onClose, onSaved, pklData }) => {
  const [form, setForm] = useState({ catatan: "", progres_saat_kunjungan: 50 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.catatan) {
      toast.error("Catatan wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await vocationalApi.addMonitoring({ pkl_id: pklData.id, ...form });
      toast.success("Monitoring berhasil dicatat");
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal menyimpan monitoring");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Monitoring Kunjungan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400">
            <p className="text-sm font-semibold text-gray-800">
              {pklData?.nama_siswa}
            </p>
            <p className="text-xs text-gray-500">{pklData?.nama_perusahaan}</p>
          </div>
          <div>
            <label className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
              <span>Capaian Progres Siswa</span>
              <span className="text-orange-600">
                {form.progres_saat_kunjungan}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.progres_saat_kunjungan}
              onChange={(e) =>
                setForm({
                  ...form,
                  progres_saat_kunjungan: parseInt(e.target.value),
                })
              }
              className="w-full accent-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Catatan Kunjungan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Deskripsikan perkembangan siswa di lokasi PKL..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Monitoring"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal Input Nilai ─────────────────────────────────────
const NilaiDialog = ({ isOpen, onClose, onSaved, pklData }) => {
  const [form, setForm] = useState({ nilai_akhir: "", keterangan_nilai: "" });
  const [saving, setSaving] = useState(false);

  const getPredikat = (n) =>
    n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : n >= 60 ? "D" : "E";

  const handleSave = async () => {
    if (!form.nilai_akhir) {
      toast.error("Nilai wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await vocationalApi.inputNilai({ pkl_id: pklData.id, ...form });
      toast.success("Nilai PKL berhasil disimpan");
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  const nilaiNum = parseFloat(form.nilai_akhir);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Input Nilai Akhir PKL
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800">
              {pklData?.nama_siswa}
            </p>
            <p className="text-xs text-gray-500">{pklData?.nama_perusahaan}</p>
          </div>
          <InputField
            type="number"
            label="Nilai Akhir (0 - 100)"
            required
            min="0"
            max="100"
            placeholder="85"
            value={form.nilai_akhir}
            onChange={(e) => setForm({ ...form, nilai_akhir: e.target.value })}
          />
          {form.nilai_akhir && !isNaN(nilaiNum) && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Predikat Otomatis</span>
              <span className="text-3xl font-black text-blue-600">
                {getPredikat(nilaiNum)}
              </span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Keterangan
            </label>
            <textarea
              rows={3}
              placeholder="Keterangan tambahan..."
              value={form.keterangan_nilai}
              onChange={(e) =>
                setForm({ ...form, keterangan_nilai: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Nilai"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Halaman Utama PKL ─────────────────────────────────────
const PKLPage = () => {
  const [pklList, setPklList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [dialog, setDialog] = useState({ type: null, data: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pklRes, progRes] = await Promise.all([
        vocationalApi.getAllPKL(),
        vocationalApi.getAllProgramKeahlian(),
      ]);
      setPklList(pklRes.data.data || []);
      setProgramList(progRes.data.data || []);
    } catch {
      toast.error("Gagal memuat data PKL");
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

  const handleDelete = async (pkl) => {
    if (!window.confirm(`Hapus data PKL siswa "${pkl.nama_siswa}"?`)) return;
    try {
      await vocationalApi.deletePKL(pkl.id);
      toast.success("Data PKL dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const filtered = pklList.filter((p) => {
    const matchSearch =
      !search ||
      p.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
      p.nama_perusahaan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status_approval === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data PKL Siswa</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pklList.length} total pengajuan
          </p>
        </div>
        <button
          onClick={() => setDialog({ type: "tambah", data: null })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          ＋ Tambah PKL
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Cari nama siswa atau perusahaan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Siswa</th>
                <th className="px-6 py-3 text-left">Perusahaan</th>
                <th className="px-6 py-3 text-left">Bidang</th>
                <th className="px-6 py-3 text-left">Progres</th>
                <th className="px-6 py-3 text-left">Kelayakan</th>
                <th className="px-6 py-3 text-left">Approval</th>
                <th className="px-6 py-3 text-left">Nilai</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((pkl) => (
                  <tr
                    key={pkl.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {pkl.nama_siswa}
                      </p>
                      <p className="text-xs text-gray-400">{pkl.kelas}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 max-w-[160px] truncate">
                        {pkl.nama_perusahaan}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">
                        {pkl.alamat_perusahaan}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {pkl.bidang_pekerjaan || "—"}
                    </td>
                    <td className="px-6 py-4 min-w-[120px]">
                      <ProgressBar value={pkl.progres_terakhir || 0} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        value={pkl.status_kelayakan || "belum_dinilai"}
                        type="kelayakan"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        value={pkl.status_approval}
                        type="approval"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {pkl.nilai_akhir ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-800">
                            {pkl.nilai_akhir}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            ({pkl.predikat})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="relative flex justify-center"
                        ref={openMenuId === pkl.id ? menuRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === pkl.id ? null : pkl.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          ⋮
                        </button>
                        {openMenuId === pkl.id && (
                          <div className="absolute right-0 top-8 z-30 bg-white border border-gray-100 rounded-xl shadow-lg w-48 py-1 text-sm">
                            <button
                              onClick={() => {
                                setDialog({ type: "edit", data: pkl });
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                            >
                              ✏️ Edit Data
                            </button>
                            <button
                              onClick={() => {
                                setDialog({ type: "validasi", data: pkl });
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                            >
                              ✅ Validasi
                            </button>
                            <button
                              onClick={() => {
                                setDialog({ type: "monitoring", data: pkl });
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                            >
                              🔍 Monitoring
                            </button>
                            <button
                              onClick={() => {
                                setDialog({ type: "nilai", data: pkl });
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                            >
                              📊 Input Nilai
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => {
                                handleDelete(pkl);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 font-medium"
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <PKLDialog
        isOpen={dialog.type === "tambah" || dialog.type === "edit"}
        onClose={() => setDialog({ type: null, data: null })}
        onSaved={fetchData}
        editData={dialog.type === "edit" ? dialog.data : null}
        programList={programList}
      />
      <ValidasiDialog
        isOpen={dialog.type === "validasi"}
        onClose={() => setDialog({ type: null, data: null })}
        onSaved={fetchData}
        pklData={dialog.data}
      />
      <MonitoringDialog
        isOpen={dialog.type === "monitoring"}
        onClose={() => setDialog({ type: null, data: null })}
        onSaved={fetchData}
        pklData={dialog.data}
      />
      <NilaiDialog
        isOpen={dialog.type === "nilai"}
        onClose={() => setDialog({ type: null, data: null })}
        onSaved={fetchData}
        pklData={dialog.data}
      />
    </div>
  );
};

export default PKLPage;
