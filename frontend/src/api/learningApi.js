import axiosInstance from './axiosInstance';

export const learningApi = {
  // ---- Perangkat Pembelajaran ----
  getAllPerangkat: () =>
    axiosInstance.get('/api/learning/perangkat'),

  uploadPerangkat: (formData) =>
    axiosInstance.post('/api/learning/perangkat', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  downloadPerangkat: (id, fileName) =>
    axiosInstance.get(`/api/learning/perangkat/${id}/download`, {
      responseType: 'blob',
    }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }),

  deletePerangkat: (id) =>
    axiosInstance.delete(`/api/learning/perangkat/${id}`),

  // ---- Nilai Siswa ----
  getNilai: (kelasId, mataPelajaran, tahunAjar) =>
    axiosInstance.get('/api/learning/nilai', {
      params: { kelas_id: kelasId, mata_pelajaran: mataPelajaran, tahun_ajar: tahunAjar },
    }),

  saveNilaiBatch: (payload) =>
    axiosInstance.post('/api/learning/nilai/batch', payload),
};
