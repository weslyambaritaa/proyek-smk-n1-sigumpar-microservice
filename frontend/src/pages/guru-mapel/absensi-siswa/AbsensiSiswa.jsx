import React, { useEffect, useState } from "react";
import { useTeacherAttendance } from "../../../hooks/useTeacherAttendance";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

const AbsensiSiswa = () => {
  const {
    classes,
    selectedClass,
    setSelectedClass,
    subjects,
    selectedSubject,
    setSelectedSubject,
    students,
    attendance,
    setAttendance,
    loading,
    error,
    stats,
    fetchClasses,
    fetchSubjects,
    fetchStudents,
    fetchAttendance,
    saveAttendance,
    computeStats,
  } = useTeacherAttendance();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass.id);
      fetchStudents(selectedClass.id);
    }
  }, [selectedClass, fetchSubjects, fetchStudents]);

  useEffect(() => {
    if (selectedClass && date && selectedSubject) {
      fetchAttendance(selectedClass.id, date, selectedSubject.id);
    }
  }, [selectedClass, date, selectedSubject, fetchAttendance]);

  useEffect(() => {
    computeStats();
  }, [students, attendance, computeStats]);

  const handleStudentStatusChange = (studentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAttendance(
        selectedClass.id,
        date,
        selectedSubject.id,
        attendance,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.namasiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading && !classes.length)
    return <div className="p-6 text-center">Memuat data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Absensi Siswa</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Pilih Kelas dengan Card */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Pilih Kelas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => {
                setSelectedClass(cls);
                setSelectedSubject(null);
              }}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                selectedClass?.id === cls.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <h3 className="font-bold text-gray-800">{cls.nama_kelas}</h3>
              <p className="text-sm text-gray-500">
                Tingkat {cls.tingkat || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedClass && (
        <>
          {/* Pilih Mata Pelajaran */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran
            </label>
            <select
              value={selectedSubject?.id || ""}
              onChange={(e) => {
                const sub = subjects.find(
                  (s) => s.id === parseInt(e.target.value),
                );
                setSelectedSubject(sub || null);
              }}
              className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nama_mapel}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Tanggal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Statistik */}
          {students.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Ringkasan Kehadiran</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  Total Siswa: <strong>{stats.total}</strong>
                </span>
                <span>
                  Hadir: <Badge variant="success">{stats.hadir}</Badge>
                </span>
                <span>
                  Sakit: <Badge variant="warning">{stats.sakit}</Badge>
                </span>
                <span>
                  Izin: <Badge variant="info">{stats.izin}</Badge>
                </span>
                <span>
                  Alpa: <Badge variant="danger">{stats.alpa}</Badge>
                </span>
                <span>
                  Terlambat: <Badge variant="warning">{stats.terlambat}</Badge>
                </span>
              </div>
            </div>
          )}

          {/* Pencarian siswa */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari siswa (nama atau NIS)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Daftar Siswa */}
          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Memuat data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">No</th>
                    <th className="px-4 py-2 text-left">Nama Siswa</th>
                    <th className="px-4 py-2 text-left">NIS</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id_siswa} className="border-t">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{student.namasiswa}</td>
                      <td className="px-4 py-2">{student.nis || "-"}</td>
                      <td className="px-4 py-2">
                        <select
                          value={attendance[student.id_siswa]?.status || ""}
                          onChange={(e) =>
                            handleStudentStatusChange(
                              student.id_siswa,
                              "status",
                              e.target.value,
                            )
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">-- Pilih --</option>
                          <option value="hadir">Hadir</option>
                          <option value="sakit">Sakit</option>
                          <option value="izin">Izin</option>
                          <option value="alpa">Alpa</option>
                          <option value="terlambat">Terlambat</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={attendance[student.id_siswa]?.keterangan || ""}
                          onChange={(e) =>
                            handleStudentStatusChange(
                              student.id_siswa,
                              "keterangan",
                              e.target.value,
                            )
                          }
                          placeholder="Keterangan"
                          className="border rounded px-2 py-1 text-sm w-40"
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-gray-500"
                      >
                        Tidak ada siswa ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !selectedSubject}
              variant="primary"
              size="lg"
            >
              {saving ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AbsensiSiswa;
