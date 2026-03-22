import axiosInstance from './axiosInstance';

// CRUD SISWA
export const getStudents = () => axiosInstance.get('/academic/students');
export const createStudent = (data) => axiosInstance.post('/academic/students', data);

// CRUD KELAS
export const getClasses = () => axiosInstance.get('/academic/classes');
export const createClass = (data) => axiosInstance.post('/academic/classes', data);