import { useCallback, useState } from "react";
import { studentApi } from "../api/studentApi";
import { academicApi } from "../api/academicApi";

const calculateFinalScore = ({
  tugas = 0,
  kuis = 0,
  uts = 0,
  uas = 0,
  praktik = 0,
}) => {
  const total =
    Number(tugas) * 0.2 +
    Number(kuis) * 0.15 +
    Number(uts) * 0.2 +
    Number(uas) * 0.25 +
    Number(praktik) * 0.2;

  return Number(total.toFixed(2));
};

const normalizeGradeItem = (item) => ({
  id: item.id || null,
  student_id: item.student_id || item.id || "",
  student_name: item.student_name || item.username || item.name || "",
  nis: item.nis || item.student_id || item.id || "-",
  tugas: Number(item.tugas || 0),
  kuis: Number(item.kuis || 0),
  uts: Number(item.uts || 0),
  uas: Number(item.uas || 0),
  praktik: Number(item.praktik || 0),
  nilai_akhir: Number(
    item.nilai_akhir ??
      calculateFinalScore({
        tugas: item.tugas || 0,
        kuis: item.kuis || 0,
        uts: item.uts || 0,
        uas: item.uas || 0,
        praktik: item.praktik || 0,
      }),
  ),
});

const normalizeStudentToGrade = (item) => ({
  id: null,
  student_id: item.id || "",
  student_name: item.nama_lengkap || item.username || item.name || "Tanpa Nama",
  nis: item.nisn || item.nis || item.id || "-",
  tugas: 0,
  kuis: 0,
  uts: 0,
  uas: 0,
  praktik: 0,
  nilai_akhir: 0,
});

const useGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadGrades = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const gradeResponse = await studentApi.getGrades(params);
      const gradeData = gradeResponse.data?.data || gradeResponse.data || [];

      if (Array.isArray(gradeData) && gradeData.length > 0) {
        const normalizedGrades = gradeData.map(normalizeGradeItem);
        setGrades(normalizedGrades);
        return normalizedGrades;
      }

      const studentResponse = await academicApi.getAllSiswa({
        kelas: params.kelas,
        search: params.search,
      });

      const studentData = Array.isArray(studentResponse.data)
        ? studentResponse.data
        : studentResponse.data?.data || [];
      const normalizedStudents = studentData.map(normalizeStudentToGrade);

      setGrades(normalizedStudents);
      return normalizedStudents;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Gagal memuat data nilai";
      setError(message);
      setGrades([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGradeValue = useCallback((index, field, value) => {
    const numericValue = value === "" ? "" : Number(value);

    setGrades((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: numericValue,
      };

      updated[index].nilai_akhir = calculateFinalScore({
        tugas: updated[index].tugas || 0,
        kuis: updated[index].kuis || 0,
        uts: updated[index].uts || 0,
        uas: updated[index].uas || 0,
        praktik: updated[index].praktik || 0,
      });

      return updated;
    });
  }, []);

  const saveAllGrades = useCallback(
    async ({ mapel, kelas, tahunAjar }) => {
      setSaving(true);
      setError(null);

      try {
        const payload = {
          mapel,
          kelas,
          tahunAjar,
          grades: grades.map((item) => ({
            student_id: item.student_id,
            student_name: item.student_name,
            nis: item.nis,
            tugas: Number(item.tugas || 0),
            kuis: Number(item.kuis || 0),
            uts: Number(item.uts || 0),
            uas: Number(item.uas || 0),
            praktik: Number(item.praktik || 0),
          })),
        };

        const response = await studentApi.saveGrades(payload);
        return response.data;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Gagal menyimpan nilai";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [grades],
  );

  return {
    grades,
    loading,
    saving,
    error,
    loadGrades,
    updateGradeValue,
    saveAllGrades,
  };
};

export default useGrades;
