const { 
  createAbsensiSiswa, 
  getAllAbsensiSiswa, 
  deleteAbsensiSiswa 
} = require("./absensiSiswaController"); // SUDAH DISESUAIKAN DENGAN FOTO FOLDER
const pool = require("../config/db");

// Mocking Database
jest.mock("../config/db", () => ({
  connect: jest.fn(),
  query: jest.fn()
}));

describe('Unit Testing CRUD Absensi Siswa - Gloria 11S23030', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    pool.connect.mockResolvedValue(mockClient);
    jest.clearAllMocks();
  });

  // TC-01: Simpan Absensi Valid
  test('TC-01: Harus BERHASIL (201) jika data absensi lengkap', async () => {
    const req = { 
      body: { id_siswa: 1, tanggal: '2026-03-31', status: 'Hadir', keterangan: 'Masuk' } 
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    mockClient.query.mockResolvedValueOnce({ rows: [{ id_siswa: 1 }] }); // Mock cek siswa
    mockClient.query.mockResolvedValueOnce({ rows: [{ id_absensi: 1, ...req.body }] }); // Mock insert
    
    await createAbsensiSiswa(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(201);
  });

 // TC-02: Format Tanggal Salah (Disesuaikan dengan error message aslimu)
  test('TC-02: Harus GAGAL (400) jika format tanggal salah (bukan YYYY-MM-DD)', async () => {
    const req = { body: { id_siswa: 1, tanggal: '31-03-2026', status: 'Hadir' } };
    const next = jest.fn();
    
    await createAbsensiSiswa(req, {}, next);
    
    // Kita cek pesan error-nya langsung sesuai hasil terminal tadi
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Format tanggal harus YYYY-MM-DD");
  });

  // TC-03: Siswa Tidak Ditemukan (Disesuaikan dengan error message aslimu)
  test('TC-03: Harus GAGAL (404) jika id_siswa tidak terdaftar', async () => {
    const req = { body: { id_siswa: 999, tanggal: '2026-03-31', status: 'Hadir' } };
    const next = jest.fn();
    
    mockClient.query.mockResolvedValueOnce({ rows: [] }); // Simulasi siswa tidak ada
    
    await createAbsensiSiswa(req, {}, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Siswa tidak ditemukan");
  });

  // TC-04: Ambil Semua Data
  test('TC-04: Harus BERHASIL (200) mengambil semua list absensi', async () => {
    const res = { json: jest.fn() };
    mockClient.query.mockResolvedValue({ rows: [{ id_absensi: 1 }], length: 1 });
    
    await getAllAbsensiSiswa({ query: {} }, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  // TC-05: Hapus Data
  test('TC-05: Harus BERHASIL (200) menghapus data absensi', async () => {
    const res = { json: jest.fn() };
    mockClient.query.mockResolvedValue({ rows: [{ id_absensi: 1 }] });
    
    await deleteAbsensiSiswa({ params: { id: 1 } }, res, jest.fn());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});