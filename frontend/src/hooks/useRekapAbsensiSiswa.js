import { useState, useCallback } from "react";
import * as rekapApi from "../api/rekapAbsensiSiswaApi";

export const useRekapAbsensiSiswa = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periode, setPeriode] = useState({});

  const fetchRekap = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await rekapApi.getRekapAbsensiSiswa(params);
      setData(res.data.data);
      setPeriode(res.data.periode);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, periode, fetchRekap };
};
