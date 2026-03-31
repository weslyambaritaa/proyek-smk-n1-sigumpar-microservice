import React, { useState, useEffect, useRef } from "react";
import { vocationalApi } from "../../api/vocationalApi";
import toast from "react-hot-toast";

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {children}
    </select>
  </div>
);

// ── Badge Predikat ────────────────────────────────────────
const PredikatBadge = ({ value }) => {
  const map = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-blue-100    text-blue-700",
    C: "bg-amber-100   text-amber-700",
    D: "bg-orange-100  text-orange-700",
    E: "bg-red-100     text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${map[value] || "bg-gray-100 text-gray-600"}`}
    >
      {value || "—"}
    </span>
  );
};

// ── Dialog Input Nilai ────────────────────────────────────
const NilaiDialog = ({ isOpen, onClose, onSaved, editData, programList }) => {
  const emptyForm = {
    siswa_id: "",
    nama_siswa: "",
    kelas: "",
    program_keahlian_id: "",
    tahun_ajaran: "2024/2025",
    semester: "ganjil",
    aspek_teori: "",
    aspek_praktik: "",
    aspek_sikap: "",
    catatan: "",
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
        tahun_ajaran: editData.tahun_ajaran || "2024/2025",
        semester: editData.semester || "ganjil",
        aspek_teori: editData.aspek_teori || "",
        aspek_praktik: editData.aspek_praktik || "",
        aspek_sikap: editData.aspek_sikap || "",
        catatan: editData.catatan || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData, isOpen]);

  const nilaiAkhir =
    form.aspek_teori && form.aspek_praktik && form.aspek_sikap
      ? (
          parseFloat(form.aspek_teori) * 0.3 +
          parseFloat(form.aspek_praktik) * 0.5 +
          parseFloat(form.aspek_sikap) * 0.2
        ).toFixed(1)
      : null;
  const predikat = nilaiAkhir
    ? nilaiAkhir >= 90
      ? "A"
      : nilaiAkhir >= 80
        ? "B"
        : nilaiAkhir >= 70
          ? "C"
          : nilaiAkhir >= 60
            ? "D"
            : "E"
    : null;

  const handleSave = async () => {
    if (!form.nama_siswa) {
      toast.error("Nama siswa wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editData) {
        await vocationalApi.updateNilai(editData.id, form);
        toast.success("Nilai berhasil diperbarui");
      } else {
        await vocationalApi.createNilai(form);
        toast.success("Nilai berhasil disimpan");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">
            {editData ? "Edit Nilai" : "Input Nilai Kompetensi"}
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
                  {p.kode_program} - {p.nama_program}
                </option>
              ))}
            </SelectField>
          </div>
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

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
              Komponen Nilai
            </p>
            <div className="grid grid-cols-3 gap-3">
              <InputField
                type="number"
                min="0"
                max="100"
                label="Teori (30%)"
                placeholder="0-100"
                value={form.aspek_teori}
                onChange={(e) =>
                  setForm({ ...form, aspek_teori: e.target.value })
                }
              />
              <InputField
                type="number"
                min="0"
                max="100"
                label="Praktik (50%)"
                placeholder="0-100"
                value={form.aspek_praktik}
                onChange={(e) =>
                  setForm({ ...form, aspek_praktik: e.target.value })
                }
              />
              <InputField
                type="number"
                min="0"
                max="100"
                label="Sikap (20%)"
                placeholder="0-100"
                value={form.aspek_sikap}
                onChange={(e) =>
                  setForm({ ...form, aspek_sikap: e.target.value })
                }
              />
            </div>
            {nilaiAkhir && (
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                <span className="text-sm text-gray-600 font-medium">
                  Nilai Akhir Otomatis
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-gray-800">
                    {nilaiAkhir}
                  </span>
                  <PredikatBadge value={predikat} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Catatan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
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
            {saving
              ? "Menyimpan..."
              : editData
                ? "Simpan Perubahan"
                : "Simpan Nilai"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Halaman Nilai Kompetensi ──────────────────────────────
const NilaiKompetensiPage = () => {
  const [nilaiList, setNilaiList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [dialog, setDialog] = useState({ open: false, data: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [nilaiRes, progRes] = await Promise.all([
        vocationalApi.getAllNilai({
          semester: filterSemester,
          program_keahlian_id: filterProgram,
        }),
        vocationalApi.getAllProgramKeahlian(),
      ]);
      setNilaiList(nilaiRes.data.data || []);
      setProgramList(progRes.data.data || []);
    } catch {
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSemester, filterProgram]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    if (openMenuId !== null) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus nilai milik "${item.nama_siswa}"?`)) return;
    try {
      await vocationalApi.deleteNilai(item.id);
      toast.success("Data nilai dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const filtered = nilaiList.filter(
    (n) =>
      !search ||
      n.nama_siswa.toLowerCase().includes(search.toLowerCase()) ||
      (n.kelas || "").toLowerCase().includes(search.toLowerCase()),
  );

  // Statistik ringkas
  const avg = filtered.length
    ? (
        filtered.reduce((s, n) => s + parseFloat(n.nilai_akhir || 0), 0) /
        filtered.length
      ).toFixed(1)
    : 0;
  const countA = filtered.filter((n) => n.predikat === "A").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Nilai Kompetensi Kejuruan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {nilaiList.length} data nilai
          </p>
        </div>
        <button
          onClick={() => setDialog({ open: true, data: null })}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          ＋ Input Nilai
        </button>
      </div>

      {/* Mini Stat */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">
              {filtered.length}
            </p>
            <p className="text-xs text-gray-500">Total Siswa</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-800">{avg}</p>
            <p className="text-xs text-gray-500">Rata-rata Nilai</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{countA}</p>
            <p className="text-xs text-gray-500">Predikat A</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="🔍 Cari siswa atau kelas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Semester</option>
          <option value="ganjil">Ganjil</option>
          <option value="genap">Genap</option>
        </select>
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Semua Program</option>
          {programList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.kode_program}
            </option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Siswa</th>
                <th className="px-5 py-3 text-left">Program</th>
                <th className="px-5 py-3 text-center">Teori</th>
                <th className="px-5 py-3 text-center">Praktik</th>
                <th className="px-5 py-3 text-center">Sikap</th>
                <th className="px-5 py-3 text-center">Nilai Akhir</th>
                <th className="px-5 py-3 text-center">Predikat</th>
                <th className="px-5 py-3 text-left">TA / Semester</th>
                <th className="px-5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {n.nama_siswa}
                      </p>
                      <p className="text-xs text-gray-400">{n.kelas}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {n.kode_program || "—"}
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-gray-700">
                      {n.aspek_teori ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-gray-700">
                      {n.aspek_praktik ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-gray-700">
                      {n.aspek_sikap ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-gray-800">
                      {n.nilai_akhir ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <PredikatBadge value={n.predikat} />
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">
                      {n.tahun_ajaran}
                      <br />
                      <span className="capitalize">{n.semester}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className="relative flex justify-center"
                        ref={openMenuId === n.id ? menuRef : null}
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === n.id ? null : n.id)
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        >
                          ⋮
                        </button>
                        {openMenuId === n.id && (
                          <div className="absolute right-0 top-8 z-30 bg-white border border-gray-100 rounded-xl shadow-lg w-36 py-1 text-sm">
                            <button
                              onClick={() => {
                                setDialog({ open: true, data: n });
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => {
                                handleDelete(n);
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

      <NilaiDialog
        isOpen={dialog.open}
        onClose={() => setDialog({ open: false, data: null })}
        onSaved={fetchData}
        editData={dialog.data}
        programList={programList}
      />
    </div>
  );
};

export default NilaiKompetensiPage;
