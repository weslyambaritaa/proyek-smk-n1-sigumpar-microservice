// frontend/src/api/authApi.js
import axiosInstance from './axiosInstance';

export const fetchUsers = async () => {
  const response = await axiosInstance.get('/auth');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post('/auth', userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/auth/${id}`);
  return response.data;
};