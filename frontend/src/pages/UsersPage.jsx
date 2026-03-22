import { useEffect, useState } from "react";
import useUsers from "../hooks/useUsers";
import UserForm from "../components/kelas/Kelas";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

/**
 * Halaman manajemen Users.
 * Mengorkestrasi semua komponen dan state untuk fitur CRUD users.
 */
const UsersPage = () => {
  const { users, loading, error, loadUsers, addUser, editUser, removeUser } =
    useUsers();

  // State untuk kontrol modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // null = mode buat baru

  // State untuk filter/pencarian
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Load data saat komponen pertama kali dimuat
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Handler functions ───────────────────────────────────────

  // Buka modal untuk membuat user baru
  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Buka modal untuk mengedit user yang dipilih
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Tutup modal dan reset state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Submit form: buat atau update user
  const handleSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await editUser(selectedUser.id, formData);
      } else {
        await addUser(formData);
      }
      handleCloseModal();
    } catch (err) {
      // Error sudah di-handle di hook, tapi bisa tambah toast notif di sini
      console.error("Gagal menyimpan:", err.message);
    }
  };

  // Konfirmasi dan hapus user
  const handleDelete = async (user) => {
    if (!window.confirm(`Hapus user "${user.name}"?`)) return;
    try {
      await removeUser(user.id);
    } catch (err) {
      console.error("Gagal menghapus:", err.message);
    }
  };

  // Aplikasikan filter pencarian (client-side filtering)
  const handleSearch = () => {
    loadUsers({ search, role: roleFilter });
  };

  // Reset filter
  const handleReset = () => {
    setSearch("");
    setRoleFilter("");
    loadUsers();
  };

  // ── Helper untuk badge role ─────────────────────────────────
  const getRoleBadgeVariant = (role) =>
    role === "admin" ? "purple" : "info";

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Header halaman */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: {users.length} user
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary">
          + Tambah User
        </Button>
      </div>

      {/* Filter dan pencarian */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
        >
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <Button onClick={handleSearch} variant="primary" size="sm">
          Cari
        </Button>
        <Button onClick={handleReset} variant="ghost" size="sm">
          Reset
        </Button>
      </div>

      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">👥</p>
          <p className="font-medium">Belum ada user</p>
          <p className="text-sm mt-1">Klik "Tambah User" untuk memulai</p>
        </div>
      )}

      {/* Tabel data users */}
      {!loading && users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Dibuat</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(user)}
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

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedUser ? "Edit User" : "Tambah User Baru"}
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={loading}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;