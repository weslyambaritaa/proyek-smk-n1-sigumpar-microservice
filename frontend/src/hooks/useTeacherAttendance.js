import { useState, useCallback } from "react";
import * as api from "../api/guruApi";

export const useTeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // key: studentId, value: { status, keterangan }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpa: 0,
    terlambat: 0,
  });

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTeacherClasses();
      setClasses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async (classId) => {
    setLoading(true);
    try {
      const res = await api.getSubjectsByClass(classId);
      setSubjects(res.data);
      if (res.data.length === 1) setSelectedSubject(res.data[0]);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (classId) => {
    setLoading(true);
    try {
      const res = await api.getClassStudents(classId);
      setStudents(res.data);
      // reset attendance when students change
      setAttendance({});
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async (classId, date, subjectId) => {
    if (!classId || !date || !subjectId) return;
    setLoading(true);
    try {
      const res = await api.getAttendanceByClass(classId, date, subjectId);
      const existing = {};
      res.data.forEach((item) => {
        existing[item.id_siswa] = {
          status: item.status,
          keterangan: item.keterangan || "",
        };
      });
      setAttendance(existing);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveAttendance = useCallback(
    async (classId, date, subjectId, attendanceData) => {
      setLoading(true);
      try {
        // Transform attendanceData into array for bulk save
        const payload = {
          classId,
          date,
          subjectId,
          attendance: Object.entries(attendanceData).map(
            ([id_siswa, { status, keterangan }]) => ({
              id_siswa,
              status,
              keterangan: keterangan || "",
            }),
          ),
        };
        await api.saveBulkAttendance(payload);
        // Re-fetch to update stats
        await fetchAttendance(classId, date, subjectId);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchAttendance],
  );

  // Update statistics based on current attendance
  const computeStats = useCallback(() => {
    const total = students.length;
    const counts = { hadir: 0, sakit: 0, izin: 0, alpa: 0, terlambat: 0 };
    students.forEach((s) => {
      const status = attendance[s.id_siswa]?.status;
      if (status && counts.hasOwnProperty(status)) counts[status]++;
    });
    setStats({ total, ...counts });
  }, [students, attendance]);

  return {
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
  };
};
