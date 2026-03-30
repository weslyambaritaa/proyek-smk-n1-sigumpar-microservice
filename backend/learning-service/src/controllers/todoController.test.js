// 1. Mocking UUID
jest.mock("uuid", () => ({
  v4: () => "test-uuid-12345",
}));

// 2. Mocking File System (fs)
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
      params: {}, // Ditambahkan agar deleteTodo bisa membaca ID
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Simulasi database JSON kosong default
    fs.readFileSync.mockReturnValue(JSON.stringify([]));
    fs.writeFileSync.mockClear();
  });

  // --- KELOMPOK TES: CREATE ---
  describe("createTodo functionality", () => {
    test("Harus gagal (Error 400) jika userId atau title tidak ada", () => {
      mockRequest.body = { userId: "", title: "" };
      createTodo(mockRequest, mockResponse, next);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain("wajib diisi");
    });

    test("Harus BERHASIL (Status 201) jika data valid", () => {
      mockRequest.body = {
        userId: "11S23030",
        title: "Implementasi Jest Gloria",
        priority: "high",
      };
      createTodo(mockRequest, mockResponse, next);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  // --- KELOMPOK TES: DELETE ---
  describe("deleteTodo functionality", () => {
    test("Harus BERHASIL (Status 200) saat menghapus todo yang ada", () => {
      const existingTodo = {
        id: "123",
        title: "Tugas Lama",
        userId: "11S23030",
      };
      fs.readFileSync.mockReturnValue(JSON.stringify([existingTodo]));

      mockRequest.params = { id: "123" };
      deleteTodo(mockRequest, mockResponse, next);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      );
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    test("Harus GAGAL (Error 404) jika menghapus ID yang tidak terdaftar", () => {
      fs.readFileSync.mockReturnValue(JSON.stringify([]));

      mockRequest.params = { id: "ID-ngasal" };
      deleteTodo(mockRequest, mockResponse, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });
  });
});
