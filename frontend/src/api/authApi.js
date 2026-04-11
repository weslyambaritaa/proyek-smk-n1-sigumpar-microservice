import axiosInstance from './axiosInstance';

export const fetchUsers = async () => {
  const response = await axiosInstance.get('/api/auth/');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axiosInstance.post('/api/auth/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/api/auth/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/api/auth/${id}/`);
  return response.data;
};