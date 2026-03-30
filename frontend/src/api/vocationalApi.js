import axiosInstance from "./axiosInstance";

export const vocationalApi = {
  approvePKL: (data) => axiosInstance.post("/vocational/approve", data),
  addMonitoring: (data) => axiosInstance.post("/vocational/monitoring", data),
  inputNilai: (data) => axiosInstance.post("/vocational/input-nilai", data),
};
