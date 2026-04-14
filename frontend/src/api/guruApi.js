import api from "./axiosInstance";

export const getTeacherClasses = () => api.get("/api/students/teacher/classes");

export const getSubjectsByClass = (classId) =>
  api.get(`/api/students/teacher/classes/${classId}/subjects`);

export const getClassStudents = (classId) =>
  api.get(`/api/students/classes/${classId}/students`);

export const getAttendanceByClass = (classId, date, subjectId) =>
  api.get(`/api/students/attendance/class/${classId}`, {
    params: { date, subjectId },
  });

export const saveBulkAttendance = (data) =>
  api.post("/api/students/attendance/bulk", data);
