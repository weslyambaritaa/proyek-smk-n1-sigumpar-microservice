export const ambilDataSiswa = async (token, queryString = "") => {
  const baseUrl = process.env.STUDENT_SERVICE_URL || "http://localhost:3008";

  const response = await fetch(`${baseUrl}/api/students${queryString}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil data siswa dari student-service");
  }

  return data;
};