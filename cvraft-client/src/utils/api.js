import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' }
});

// Auto attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cvraft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cvraft_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
