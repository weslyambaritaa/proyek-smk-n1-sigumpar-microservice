import axiosInstance from './axiosInstance';

export const vocationApi = {
  // --- PKL SUBMISSIONS ---
  getSubmissions: () => axiosInstance.get('/api/pkl/submissions'),
  validateSubmission: (id, data) => axiosInstance.put(`/api/pkl/submissions/${id}/validate`, data),

  // --- PKL PENEMPATAN ---
  getPenempatan: () => axiosInstance.get('/api/pkl/penempatan'),
  createPenempatan: (formData) => axiosInstance.post('/api/pkl/penempatan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
