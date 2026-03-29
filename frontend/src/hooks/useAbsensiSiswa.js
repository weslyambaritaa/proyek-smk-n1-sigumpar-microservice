import { useState, useCallback } from "react";
import * as api from "../api/absensiSiswaApi";

export const useAbsensiSiswa = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAbsensiSiswa(params);
      // Asumsikan respons: { success: true, data: [...] }
      setData(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createAbsensiSiswa(payload);
      const newItem = res.data.data;
      setData((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.updateAbsensiSiswa(id, payload);
      const updatedItem = res.data.data;
      setData((prev) =>
        prev.map((item) => (item.id_absensi === id ? updatedItem : item)),
      );
      return updatedItem;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteAbsensiSiswa(id);
      setData((prev) => prev.filter((item) => item.id_absensi !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, loadData, create, update, remove };
};
