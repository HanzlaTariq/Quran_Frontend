// src/config/axios.js
import axios from 'axios';

// ⚠️ FIX: Use port 5001
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001', // Port 5001
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har request mein token add karo
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - errors handle karo
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;