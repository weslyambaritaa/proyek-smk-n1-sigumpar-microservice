// const pool = require("../config/db");

// 1. Ambil Semua User dari Keycloak
const getAll = async (req, res, next) => {
  try {
    // Keycloak menyimpan data user di tabel "user_entity"
    // const result = await pool.query(
    //   "SELECT id, username, email FROM user_entity ORDER BY username ASC",
    // );
    // res.json({ success: true, data: result.rows });
    res.json({ success: true, data: [] }); // Temporary mock
  } catch (err) {
    next(err);
  }
};

// 2. Pencarian Wali Kelas dari Keycloak
const searchUsers = async (req, res, next) => {
  const { q } = req.query;
  try {
    console.log("Search query:", q);

    // Temporary: Return mock data for wali kelas search
    // TODO: Implement proper Keycloak user search
    const mockUsers = [
      {
        id: "wali-1",
        nama_lengkap: "Siti Aminah",
        username: "siti.aminah",
        email: "siti.aminah@school.com",
      },
      {
        id: "wali-2",
        nama_lengkap: "Ahmad Rahman",
        username: "ahmad.rahman",
        email: "ahmad.rahman@school.com",
      },
      {
        id: "wali-3",
        nama_lengkap: "Dewi Sartika",
        username: "dewi.sartika",
        email: "dewi.sartika@school.com",
      },
    ];

    // For now, return all users
    res.json(mockUsers);
  } catch (err) {
    console.error("Error searching wali kelas:", err);
    res.status(500).json({ error: err.message });
  }
};

// 3. Ambil User berdasarkan Role
const getUsersByRole = async (req, res, next) => {
  const { role } = req.params;
  try {
    // Temporary: Return mock data for role-based user retrieval
    // TODO: Implement proper Keycloak role-based user retrieval
    let mockUsers = [];

    if (role === "wali-kelas") {
      mockUsers = [
        {
          id: "wali-1",
          nama_lengkap: "Siti Aminah",
          username: "siti.aminah",
          email: "siti.aminah@school.com",
        },
        {
          id: "wali-2",
          nama_lengkap: "Ahmad Rahman",
          username: "ahmad.rahman",
          email: "ahmad.rahman@school.com",
        },
        {
          id: "wali-3",
          nama_lengkap: "Dewi Sartika",
          username: "dewi.sartika",
          email: "dewi.sartika@school.com",
        },
      ];
    } else if (role === "guru-mapel") {
      mockUsers = [
        {
          id: "guru-1",
          nama_lengkap: "Budi Santoso",
          username: "budi.santoso",
          email: "budi.santoso@school.com",
        },
        {
          id: "guru-2",
          nama_lengkap: "Maya Sari",
          username: "maya.sari",
          email: "maya.sari@school.com",
        },
      ];
    } else if (role === "kepala-sekolah") {
      mockUsers = [
        {
          id: "kepsek-1",
          nama_lengkap: "Dr. Hendro Wicaksono",
          username: "hendro.wicaksono",
          email: "hendro.wicaksono@school.com",
        },
      ];
    }

    res.json({ success: true, data: mockUsers });
  } catch (err) {
    next(err);
  }
};

// 3. Fungsi Sinkronisasi (Dikosongkan)
// Karena kita sudah membaca langsung dari Keycloak DB,
// kita tidak perlu lagi menyimpan ulang datanya saat user login.
const syncUserFromToken = async (userData) => {
  // Tidak melakukan apa-apa
  return true;
};

module.exports = {
  getAll,
  searchUsers,
  getUsersByRole,
  syncUserFromToken,
};
