// File: src/controllers/authController.js

// 1. Panggil model dari pintu utama _index.js
const { UserModel } = require('../models/_index');
// Panggil Operator dari Sequelize untuk fitur pencarian (seperti ILIKE)
const { Op } = require('sequelize');

// 1. Ambil Semua User dari Keycloak
const getAll = async (req, res, next) => {
  try {
    // Menggunakan ORM: SELECT id, username, email FROM user_entity ORDER BY username ASC
    const users = await UserModel.findAll({
      attributes: ['id', 'username', 'email'], // Hanya mengambil kolom yang dibutuhkan
      order: [['username', 'ASC']]
    });
    
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// 2. Pencarian Wali Kelas dari Keycloak
const searchUsers = async (req, res, next) => {
  const { q } = req.query;
  
  try {
    if (!q) return res.json([]);
    
    // Menggunakan ORM: Pencarian dengan ILIKE, alias kolom, dan Limit
    const users = await UserModel.findAll({
      attributes: [
        'id', 
        ['username', 'nama_lengkap'] // Alias: mengubah nama username menjadi nama_lengkap di response
      ],
      where: {
        username: {
          [Op.iLike]: `%${q}%` // Mencari string yang mengandung huruf 'q' (case-insensitive)
        }
      },
      limit: 10
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Fungsi Sinkronisasi (Dikosongkan)
// Karena kita sudah membaca langsung dari Keycloak DB, 
// kita tidak perlu lagi menyimpan ulang datanya saat user login.
const syncUserFromToken = async (userData) => {
  // Tidak melakukan apa-apa
  return true; 
};

// Ekspor semua fungsi
module.exports = {
  getAll,
  searchUsers,
  syncUserFromToken
};