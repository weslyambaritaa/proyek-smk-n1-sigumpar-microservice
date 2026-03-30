import { useState, useCallback } from "react";
import * as authApi from "../api/authApi";

/**
 * Custom Hook: useUsers
 *
 * Mengelola state dan operasi CRUD untuk data users.
 * Komponen yang menggunakan hook ini tidak perlu tahu
 * bagaimana data di-fetch atau di-simpan.
 *
 * @returns {Object} State dan fungsi untuk manajemen users
 */
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Mengambil semua users dari API.
   * useCallback mencegah fungsi dibuat ulang di setiap render
   * kecuali dependency-nya berubah.
   */
  const loadUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.fetchUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      // finally selalu dijalankan — pastikan loading selalu false setelahnya
      setLoading(false);
    }
  }, []);

  /**
   * Membuat user baru dan menambahkannya ke state lokal
   * tanpa perlu re-fetch semua data (optimistic update pattern).
   */
  const addUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authApi.createUser(userData);
      // Update state lokal — tambah user baru ke array
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw agar komponen bisa handle juga
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mengupdate user dan sinkronisasi ke state lokal
   */
  const editUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await authApi.updateUser(id, userData);
      // Ganti user yang diupdate di array state
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Menghapus user dari API dan dari state lokal
   */
  const removeUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.deleteUser(id);
      // Filter out user yang dihapus dari state
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    editUser,
    removeUser,
  };
};

export default useUsers;