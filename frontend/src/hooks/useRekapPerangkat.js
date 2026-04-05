import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8001/api/learning";

export const useRekapPerangkat = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      if (!token) throw new Error("Token tidak ditemukan");
      const res = await fetch(`${API_BASE}/rekap-perangkat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Gagal mengambil data");
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = async (id, fileName) => {
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      if (!token) throw new Error("Token tidak ditemukan");
      const res = await fetch(`${API_BASE}/rekap-perangkat/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, fetchData, downloadFile };
};
