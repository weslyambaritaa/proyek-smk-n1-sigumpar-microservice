// 1. Mocking UUID di paling atas untuk menghindari SyntaxError 'export'
jest.mock("uuid", () => ({
  v4: () => "test-uuid-12345",
}));

// 2. Mocking File System (fs) agar tidak merusak file JSON asli
jest.mock("fs");

const { createTodo } = require("./todoController");
const fs = require("fs");

describe("Todo Controller - createTodo", () => {
  let mockRequest;
  let mockResponse;
  let next;

  beforeEach(() => {
    // Reset status setiap kali tes baru dimulai
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Simulasi database JSON kosong
    fs.readFileSync.mockReturnValue(JSON.stringify([]));
    fs.writeFileSync.mockClear();
  });

  test("Harus gagal (Error 400) jika userId atau title tidak ada", () => {
    mockRequest.body = { userId: "", title: "" };

    createTodo(mockRequest, mockResponse, next);

    // Memastikan error handler dipanggil
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain("wajib diisi");
  });

  test("Harus gagal (Error 400) jika priority bukan low/medium/high", () => {
    mockRequest.body = {
      userId: "11S23030",
      title: "Belajar Testing",
      priority: "very-high", // Salah
    };

    createTodo(mockRequest, mockResponse, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
  });

  test("Harus BERHASIL (Status 201) jika data valid", () => {
    mockRequest.body = {
      userId: "11S23030",
      title: "Implementasi Jest Gloria",
      priority: "high",
    };

    createTodo(mockRequest, mockResponse, next);

    // Cek apakah response statusnya 201
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // Cek apakah data yang dikembalikan sesuai
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: "test-uuid-12345",
          title: "Implementasi Jest Gloria",
          status: "pending", // Default status
        }),
      }),
    );

    // Memastikan data "seolah-olah" ditulis ke file
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
