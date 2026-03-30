import api from "./axiosInstance";

export const getTeacherClasses = () => api.get("/api/academic/teacher/classes");

export const getSubjectsByClass = (classId) =>
  api.get(`/api/academic/teacher/classes/${classId}/subjects`);

export const getClassStudents = (classId) =>
  api.get(`/api/academic/classes/${classId}/students`);

export const getAttendanceByClass = (classId, date, subjectId) =>
  api.get(`/api/academic/attendance/class/${classId}`, {
    params: { date, subjectId },
  });

export const saveBulkAttendance = (data) =>
  api.post("/api/academic/attendance/bulk", data);
