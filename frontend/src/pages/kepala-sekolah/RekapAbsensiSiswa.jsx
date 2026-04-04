import React, { useState, useEffect } from "react";
import { useRekapAbsensiSiswa } from "../../hooks/useRekapAbsensiSiswa";
import Button from "../../components/ui/Button";
import * as XLSX from "xlsx"; // npm install xlsx

const RekapAbsensiSiswa = () => {
  const { data, loading, error, periode, fetchRekap } = useRekapAbsensiSiswa();
  const [filters, setFilters] = useState({
    tanggal_awal: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    tanggal_akhir: new Date().toISOString().slice(0, 10),
    id_kelas: "",
    id_mapel: "",
  });

  const [listKelas, setListKelas] = useState([]);
  const [listMapel, setListMapel] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          (window.keycloak && window.keycloak.token);
        if (!token) return;

        const kelasRes = await fetch(
          "http://localhost:8001/api/academic/kelas",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const kelasData = await kelasRes.json();
        setListKelas(kelasData.data || []);

        const mapelRes = await fetch(
          "http://localhost:8001/api/academic/mapel",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const mapelData = await mapelRes.json();
        setListMapel(mapelData.data || []);
      } catch (err) {
        console.error("Gagal mengambil opsi filter:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchRekap(filters);
  };

  const handleReset = () => {
    const defaultStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    )
      .toISOString()
      .slice(0, 10);
    const defaultEnd = new Date().toISOString().slice(0, 10);
    setFilters({
      tanggal_awal: defaultStart,
      tanggal_akhir: defaultEnd,
      id_kelas: "",
      id_mapel: "",
    });
    fetchRekap({ tanggal_awal: defaultStart, tanggal_akhir: defaultEnd });
  };

  const exportToExcel = () => {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        "Nama Siswa": item.nama_siswa,
        NIS: item.nis,
        Kelas: item.nama_kelas,
        Hadir: item.hadir,
        Sakit: item.sakit,
        Izin: item.izin,
        Alpa: item.alpa,
        Terlambat: item.terlambat,
        "Total Hari": item.total_hari,
        "Persentase Kehadiran (%)": item.persentase_kehadiran,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Absensi Siswa");
    XLSX.writeFile(
      workbook,
      `rekap_absensi_siswa_${periode.tanggal_awal}_sd_${periode.tanggal_akhir}.xlsx`,
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rekap Absensi Siswa</h1>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Awal
          </label>
          <input
            type="date"
            name="tanggal_awal"
            value={filters.tanggal_awal}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            name="tanggal_akhir"
            value={filters.tanggal_akhir}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kelas
          </label>
          <select
            name="id_kelas"
            value={filters.id_kelas}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {listKelas.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>
                {kelas.nama_kelas}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mata Pelajaran
          </label>
          <select
            name="id_mapel"
            value={filters.id_mapel}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Mata Pelajaran</option>
            {listMapel.map((mapel) => (
              <option key={mapel.id} value={mapel.id}>
                {mapel.nama_mapel}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-end">
          <Button onClick={handleSearch} variant="primary">
            Cari
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
          <Button
            onClick={exportToExcel}
            variant="success"
            disabled={!data.length}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">📊</p>
          <p className="font-medium">Belum ada data rekap</p>
          <p className="text-sm mt-1">Silakan pilih periode dan klik Cari</p>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Nama Siswa</th>
                <th className="px-4 py-2 text-left">NIS</th>
                <th className="px-4 py-2 text-left">Kelas</th>
                <th className="px-4 py-2 text-center">Hadir</th>
                <th className="px-4 py-2 text-center">Sakit</th>
                <th className="px-4 py-2 text-center">Izin</th>
                <th className="px-4 py-2 text-center">Alpa</th>
                <th className="px-4 py-2 text-center">Terlambat</th>
                <th className="px-4 py-2 text-center">Total Hari</th>
                <th className="px-4 py-2 text-center">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{item.nama_siswa}</td>
                  <td className="px-4 py-2">{item.nis}</td>
                  <td className="px-4 py-2">{item.nama_kelas}</td>
                  <td className="px-4 py-2 text-center text-green-600">
                    {item.hadir}
                  </td>
                  <td className="px-4 py-2 text-center text-yellow-600">
                    {item.sakit}
                  </td>
                  <td className="px-4 py-2 text-center text-blue-600">
                    {item.izin}
                  </td>
                  <td className="px-4 py-2 text-center text-red-600">
                    {item.alpa}
                  </td>
                  <td className="px-4 py-2 text-center text-orange-600">
                    {item.terlambat}
                  </td>
                  <td className="px-4 py-2 text-center font-medium">
                    {item.total_hari}
                  </td>
                  <td className="px-4 py-2 text-center font-bold">
                    {item.persentase_kehadiran}%
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

export default RekapAbsensiSiswa;
