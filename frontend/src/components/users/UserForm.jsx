import { useState, useEffect } from "react";
import Button from "../ui/Button";

/**
 * Form untuk membuat dan mengedit user.
 * Komponen ini bersifat "controlled" — semua input dikontrol oleh React state.
 *
 * Props:
 * - initialData: data user yang akan diedit (null = mode buat baru)
 * - onSubmit: callback dipanggil saat form di-submit dengan data valid
 * - onCancel: callback dipanggil saat tombol Batal diklik
 * - isLoading: menampilkan state loading saat submit
 */
const UserForm = ({ initialData = null, onSubmit, onCancel, isLoading }) => {
  // State form dengan nilai default
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});

  // Jika ada initialData (mode edit), isi form dengan data tersebut
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "user",
      });
    }
  }, [initialData]);

  /**
   * Handler generic untuk semua input
   * Menggunakan name attribute untuk tahu field mana yang berubah
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error field yang sedang diisi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Validasi form sebelum submit
   * @returns {boolean} true jika valid
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Field Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.name ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Field Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contoh@email.com"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${errors.email ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Field Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Buat User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;