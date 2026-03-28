import { useCallback, useState } from "react";
import { studentApi } from "../api/studentApi";

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

const useGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadGrades = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await studentApi.getGrades(params);
      const data = response.data?.data || [];

      const normalized = data.map((item) => ({
        id: item.id,
        student_id: item.student_id,
        student_name: item.student_name,
        nis: item.nis,
        tugas: Number(item.tugas || 0),
        kuis: Number(item.kuis || 0),
        uts: Number(item.uts || 0),
        uas: Number(item.uas || 0),
        praktik: Number(item.praktik || 0),
        nilai_akhir: Number(item.nilai_akhir || 0),
      }));

      setGrades(normalized);
      return normalized;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Gagal memuat nilai");
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

  const saveAllGrades = useCallback(async ({ mapel, kelas, tahunAjar }) => {
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
      setError(err.response?.data?.message || err.message || "Gagal menyimpan nilai");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [grades]);

  return {
    grades,
    loading,
    saving,
    error,
    setGrades,
    loadGrades,
    updateGradeValue,
    saveAllGrades,
  };
};

export default useGrades;