import axiosInstance from "./axiosInstance";

export const studentApi = {
  getGrades: (params) => axiosInstance.get("/api/grades", { params }),
  saveGrades: (data) => axiosInstance.post("/api/grades/save", data),
  getStudents: () => axiosInstance.get("/api/students"),
};