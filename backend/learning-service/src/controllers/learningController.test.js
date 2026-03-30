// 1. Mocking Database Pool & Multer di paling atas
jest.mock('../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

// Mocking Multer agar tidak benar-benar memproses file ke disk/memory asli
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, cb) => cb(null), // Simulasi upload sukses
  });
  multer.memoryStorage = jest.fn();
  return multer;
});

const pool = require('../config/db');
const { 
  uploadPerangkat, 
  downloadPerangkat, 
  saveNilaiBatch 
} = require('./learningController');

describe("Learning Controller - Unit Testing Gloria (Fix Version)", () => {
  let mockReq;
  let mockRes;
  let mockClient;

  beforeEach(() => {
    // Reset Request & Response
    mockReq = {
      user: { sub: 'GURU-11S23030' }, // Identitas Gloria sebagai Guru
      body: {},
      params: {},
      query: {},
      file: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn(),
      send: jest.fn()
    };
    
    // Mock Database Client untuk Transaksi Batch Nilai
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    pool.connect.mockResolvedValue(mockClient);
    
    jest.clearAllMocks();
  });

  // --- KELOMPOK 1: UPLOAD PERANGKAT ---
  describe("uploadPerangkat Logic", () => {
    test("Harus GAGAL (400) jika file tidak disertakan", async () => {
      mockReq.body = { nama_dokumen: "RPP", jenis_dokumen: "RPP" };
      mockReq.file = null; // Tidak ada file

      await uploadPerangkat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining("File wajib") })
      );
    });

    test("Harus BERHASIL (201) jika semua data valid", async () => {
      mockReq.body = { nama_dokumen: "RPP Gloria", jenis_dokumen: "RPP" };
      mockReq.file = {
        originalname: "rpp.pdf",
        buffer: Buffer.from("dummy"),
        mimetype: "application/pdf"
      };

      pool.query.mockResolvedValue({ 
        rows: [{ id: 1, nama_dokumen: "RPP Gloria" }] 
      });

      await uploadPerangkat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  // --- KELOMPOK 2: SECURITY & DOWNLOAD ---
  describe("downloadPerangkat Security", () => {
    test("Harus GAGAL (403) jika akses file milik guru lain", async () => {
      mockReq.params = { id: '99' };
      pool.query.mockResolvedValue({ 
        rows: [{ file_name: "test.pdf", guru_id: "GURU-LAIN" }] 
      });

      await downloadPerangkat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Akses ditolak" })
      );
    });

    test("Harus GAGAL (404) jika dokumen tidak ada di DB", async () => {
      mockReq.params = { id: '404' };
      pool.query.mockResolvedValue({ rows: [] }); // DB Kosong

      await downloadPerangkat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // --- KELOMPOK 3: NILAI SISWA (MATH) ---
  describe("saveNilaiBatch Calculations", () => {
    test("Harus menghitung Nilai Akhir dengan Rumus 20/10/30/30/10", async () => {
      mockReq.body = {
        kelas_id: 'K1', mata_pelajaran: 'X', tahun_ajar: '2026',
        nilai: [{ 
          siswa_id: 'S1', 
          nilai_tugas: 100, // 20
          nilai_kuis: 100,  // 10
          nilai_uts: 100,   // 30
          nilai_uas: 100,   // 30
          nilai_praktik: 100 // 10
          // Total: 100
        }]
      };

      await saveNilaiBatch(mockReq, mockRes);

      // Ambil argumen ke-13 (nilai_akhir) dari query INSERT
      const insertCall = mockClient.query.mock.calls.find(c => c[0].includes('INSERT'));
      expect(insertCall[1][13]).toBe(100);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });
});