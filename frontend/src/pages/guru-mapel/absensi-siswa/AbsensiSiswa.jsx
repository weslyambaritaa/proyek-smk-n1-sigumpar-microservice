import React, { useEffect, useState } from "react";
import { useAbsensiSiswa } from "../../../hooks/useAbsensiSiswa";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Badge from "../../../components/ui/Badge";

const AbsensiSiswa = () => {
  const { data, loading, error, loadData, create, update, remove } =
    useAbsensiSiswa();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    id_siswa: "",
    tanggal: "",
    status: "hadir",
    keterangan: "",
  });
  const [filters, setFilters] = useState({
    id_siswa: "",
    tanggal: "",
    status: "",
  });

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({ id_siswa: "", tanggal: "", status: "hadir", keterangan: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditing(item);
    setForm({
      id_siswa: item.id_siswa,
      tanggal: item.tanggal,
      status: item.status,
      keterangan: item.keterangan || "",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await update(editing.id_absensi, form);
      } else {
        await create(form);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus absensi ini?")) {
      try {
        await remove(id);
      } catch (err) {}
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      hadir: "success",
      sakit: "warning",
      izin: "info",
      alpa: "danger",
      terlambat: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Absensi Siswa</h1>
        <Button onClick={handleOpenCreate} variant="primary">
          + Tambah Absensi
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="ID Siswa"
          value={filters.id_siswa}
          onChange={(e) => handleFilterChange("id_siswa", e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={filters.tanggal}
          onChange={(e) => handleFilterChange("tanggal", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Semua Status</option>
          <option value="hadir">Hadir</option>
          <option value="sakit">Sakit</option>
          <option value="izin">Izin</option>
          <option value="alpa">Alpa</option>
          <option value="terlambat">Terlambat</option>
        </select>
        <Button onClick={() => loadData(filters)} variant="primary" size="sm">
          Cari
        </Button>
        <Button
          onClick={() => setFilters({ id_siswa: "", tanggal: "", status: "" })}
          variant="ghost"
          size="sm"
        >
          Reset
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-medium">Belum ada data absensi</p>
          <p className="text-sm mt-1">Klik "Tambah Absensi" untuk memulai</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  ID Siswa
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Nama Siswa
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Tanggal
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Keterangan
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr
                  key={item.id_absensi}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.id_siswa}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.namaSiswa || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.tanggal}</td>
                  <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.keterangan || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item.id_absensi)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editing ? "Edit Absensi" : "Tambah Absensi Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Siswa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id_siswa"
              value={form.id_siswa}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hadir">Hadir</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
              <option value="alpa">Alpa</option>
              <option value="terlambat">Terlambat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : editing
                  ? "Simpan Perubahan"
                  : "Buat Absensi"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AbsensiSiswa;
