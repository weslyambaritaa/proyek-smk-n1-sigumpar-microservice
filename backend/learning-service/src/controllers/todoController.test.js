 // 1. Mocking UUID & File System di paling atas
jest.mock("uuid", () => ({ 
  v4: () => "test-uuid-12345" 
}));
jest.mock("fs");

const { createTodo, deleteTodo } = require("./todoController");
const fs = require("fs");

describe("Todo Controller - Unit Testing Gloria", () => {
  let mockRequest;
  let mockResponse;
  let next;

  beforeEach(() => {
    // Reset status setiap kali tes baru dimulai
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Simulasi database JSON kosong default
    fs.readFileSync.mockReturnValue(JSON.stringify([]));
    fs.writeFileSync.mockClear();
  });

  // --- KELOMPOK TES: CREATE TODO ---
  describe("Fungsi createTodo", () => {
    test("Harus GAGAL (400) jika data tidak lengkap", () => {
      mockRequest.body = { userId: "", title: "" };
      createTodo(mockRequest, mockResponse, next);
      
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });

    test("Harus GAGAL (400) jika priority salah", () => {
      mockRequest.body = { userId: "11S23030", title: "Test", priority: "super-high" };
      createTodo(mockRequest, mockResponse, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    test("Harus BERHASIL (201) jika data valid", () => {
      mockRequest.body = {
        userId: "11S23030",
        title: "Implementasi Jest Gloria",
        priority: "high",
      };
      
      createTodo(mockRequest, mockResponse, next);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  // --- KELOMPOK TES: DELETE TODO ---
  describe("Fungsi deleteTodo", () => {
    test("Harus BERHASIL saat menghapus ID yang ada", () => {
      // Pastikan ID pakai String '123' karena Christian pakai ===
      const dataLama = [{ id: '123', title: 'Tugas Lama', userId: '11S23030' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(dataLama));
      
      mockRequest.params = { id: '123' };
      deleteTodo(mockRequest, mockResponse, next);

      // Cek apakah JSON berhasil dikirim dengan pesan sukses
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          success: true, 
          message: "Todo berhasil dihapus" 
        })
      );
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("Harus GAGAL (404) jika ID tidak ditemukan", () => {
      fs.readFileSync.mockReturnValue(JSON.stringify([])); // Database kosong
      
      mockRequest.params = { id: 'ID-ngasal' };
      deleteTodo(mockRequest, mockResponse, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain("tidak ditemukan");
    });
  });
});