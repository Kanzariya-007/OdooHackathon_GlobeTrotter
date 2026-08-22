import axios from 'axios';

// Get base URL from environment or default to local development port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('globetrotter_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear storage and optionally trigger redirect or state change
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('globetrotter_token');
      localStorage.removeItem('globetrotter_user');
      // In a real application, you could redirect to login here or broadcast an event
    }
    
    // Construct a standard error message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({
      originalError: error,
      message,
      status: error.response?.status,
    });
  }
);

export default api;
