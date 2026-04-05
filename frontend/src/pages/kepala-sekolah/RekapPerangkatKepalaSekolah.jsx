import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:8001/api/learning";

const RekapPerangkatKepalaSekolah = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      if (!token) throw new Error("Token tidak ditemukan");
      let url = `${API_BASE}/rekap-perangkat?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
      else throw new Error(json.message || "Gagal");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: "Setujui perangkat?",
      text: "Perangkat ini akan disetujui.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, setujui",
    });
    if (!confirm.isConfirmed) return;
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      const res = await fetch(`${API_BASE}/rekap-perangkat/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", "Perangkat disetujui", "success");
        fetchData();
      } else throw new Error(json.message);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleReject = async (id) => {
    const { value: feedback } = await Swal.fire({
      title: "Tolak perangkat",
      input: "textarea",
      inputLabel: "Berikan alasan atau perbaikan yang diperlukan",
      inputPlaceholder: "Tuliskan feedback...",
      inputAttributes: { required: true },
      showCancelButton: true,
      confirmButtonText: "Kirim",
      inputValidator: (value) => !value && "Feedback tidak boleh kosong!",
    });
    if (!feedback) return;
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      const res = await fetch(`${API_BASE}/rekap-perangkat/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire(
          "Ditolak",
          "Perangkat ditolak dan feedback telah dikirim",
          "info",
        );
        fetchData();
      } else throw new Error(json.message);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const token = localStorage.getItem("token") || window.keycloak?.token;
      const res = await fetch(`${API_BASE}/rekap-perangkat/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal download");
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rekap Perangkat Pembelajaran</h1>
      <div className="bg-white rounded-xl border p-4 mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Refresh
        </button>
      </div>
      {loading && <div className="text-center py-10">Loading...</div>}
      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-gray-400">Tidak ada data</div>
      )}
      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Jenis</th>
                <th className="px-4 py-2 text-left">Guru ID</th>
                <th className="px-4 py-2 text-center">Tgl Upload</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Feedback</th>
                <th className="px-4 py-2 text-center">File</th>
                <th className="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.nama_dokumen}</td>
                  <td className="px-4 py-2">{item.jenis_dokumen}</td>
                  <td className="px-4 py-2">{item.guru_id}</td>
                  <td className="px-4 py-2 text-center">
                    {item.tanggal_upload}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${item.status === "pending" ? "bg-yellow-100 text-yellow-800" : item.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {item.status === "pending"
                        ? "Menunggu"
                        : item.status === "approved"
                          ? "Disetujui"
                          : "Ditolak"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-600">
                    {item.feedback || "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDownload(item.id, item.file_name)}
                      className="text-blue-600 hover:underline"
                    >
                      📄 Download
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.status === "pending" && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RekapPerangkatKepalaSekolah;
