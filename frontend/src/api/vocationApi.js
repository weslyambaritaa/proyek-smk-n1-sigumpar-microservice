import axiosInstance from './axiosInstance';

export const vocationApi = {
  // --- PKL SUBMISSIONS ---
  getSubmissions: () => axiosInstance.get('/api/pkl/submissions'),
  validateSubmission: (id, data) => axiosInstance.put(`/api/pkl/submissions/${id}/validate`, data),
};
