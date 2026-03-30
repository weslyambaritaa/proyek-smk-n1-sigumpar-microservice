// 1. Import Controller - Pastikan path file ini ada di src/controllers/
const { 
  createReviewWakasek, 
  updateReviewWakasek, 
  deleteReviewWakasek,
  getAllReviewWakasek
} = require('./reviewWakasekController');

const { getRekapAbsensi } = require('./absensiGuruController');
const { createEvaluasi } = require('./evaluasiGuruController');
const { getCatatanById } = require('./catatanMengajarController');
const { getPerangkatById } = require('./perangkatController');
const { createReviewKepsek } = require('./reviewKepsekController');

// 2. Mocking Database
jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require('../config/db');

describe("Wakil Kepala Sekolah - Integrated Unit Testing Gloria (11S23030)", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset objek req dan res sebelum setiap test case running
    mockReq = { 
      user: { role: 'WAKASEK', sub: 'WAKAP-GLORIA' }, 
      body: {}, 
      params: {}, 
      query: {} 
    };
    mockRes = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn().mockReturnThis() 
    };
    jest.clearAllMocks();
  });

  // --- GROUP 1: REVIEW WAKASEK (Logic Daniel) ---
  describe("reviewWakasek Logic", () => {
    test("TC-WKP-01: Harus BERHASIL (201) saat membuat review valid", async () => {
      mockReq.body = { 
        id_perangkatPembelajaran: 10, 
        komentarRPP: "Sesuai Kurikulum" 
      };
      pool.query.mockResolvedValue({ rows: [{ id: 1, komentarRPP: "Sesuai Kurikulum" }] });

      await createReviewWakasek(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test("TC-WKP-02: Harus GAGAL (400) jika komentar kosong", async () => {
      mockReq.body = { id_perangkatPembelajaran: 10 }; // Tanpa komentar
      await createReviewWakasek(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("TC-WKP-03: Harus BERHASIL (200) mengambil list review", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      await getAllReviewWakasek(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // --- GROUP 2: EVALUASI GURU ---
  describe("evaluasiGuru Logic", () => {
    test("TC-WKP-04: Harus BERHASIL (201) simpan evaluasi", async () => {
      await createEvaluasi(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test("TC-WKP-05: Error Handling - Database 500", async () => {
      pool.query.mockRejectedValue(new Error("Database Error"));
      await getAllReviewWakasek(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  // --- GROUP 3: MONITORING (ABSENSI & CATATAN) ---
  describe("Monitoring Guru Logic", () => {
    test("TC-WKP-06: Harus BERHASIL (200) menampilkan rekap absensi", async () => {
      await getRekapAbsensi(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("TC-WKP-07: Harus BERHASIL (200) melihat detail catatan", async () => {
      mockReq.params.id = 1;
      await getCatatanById(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // --- GROUP 4: SYSTEM SECURITY & INTEGRITY ---
  describe("System Security & Integrity", () => {
    test("TC-WKP-08: Security Test - Fitur Kepsek (201 Created)", async () => {
      await createReviewKepsek(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test("TC-WKP-09: Harus BERHASIL (200) get detail perangkat", async () => {
      mockReq.params.id = 100;
      pool.query.mockResolvedValue({ rows: [{ id: 100, nama_mapel: 'Informatika' }] });
      await getPerangkatById(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test("TC-WKP-10: Delete Review Logic (200 OK)", async () => {
      mockReq.params.id = 5;
      // Mock harus mengembalikan baris yang dihapus agar tidak kena 404
      pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
      
      await deleteReviewWakasek(mockReq, mockRes);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        success: true,
        message: "Review berhasil dihapus"
      }));
    });
  });
});