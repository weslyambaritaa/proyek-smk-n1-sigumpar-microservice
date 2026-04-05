// src/hooks/useEvaluasiGuru.js
import { useState, useEffect, useCallback } from "react";
import { fetchEvaluasiGuru, simpanEvaluasi } from "../api/evaluasiGuru";
import Swal from "sweetalert2";

export const useEvaluasiGuru = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periode, setPeriode] = useState(() => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    return `${year}/${nextYear} Ganjil`;
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEvaluasiGuru(periode);
      setData(result);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [periode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveEvaluasi = async (guruId, nilai, komentar) => {
    try {
      await simpanEvaluasi(guruId, nilai, komentar, periode);
      Swal.fire("Berhasil", "Evaluasi tersimpan", "success");
      await loadData();
      return true;
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
      return false;
    }
  };

  return { data, loading, periode, setPeriode, saveEvaluasi, reload: loadData };
};
