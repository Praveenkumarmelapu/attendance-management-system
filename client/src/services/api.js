/**
 * services/api.js — Axios API Service
 *
 * This is the central place for ALL HTTP requests to the backend.
 *
 * Why use Axios?
 * - Axios is a popular HTTP client that makes fetch requests easier
 * - It automatically converts JSON responses
 * - We can set a base URL and authorization headers once
 *
 * How this works:
 * 1. We create one Axios instance with our backend URL
 * 2. A "request interceptor" automatically adds the JWT token to every request
 * 3. A "response interceptor" handles 401 errors (expired/invalid token)
 * 4. We export functions for each API endpoint
 */

import axios from 'axios';

// The base URL of our Express backend (proxied through Vite in dev and tunnels)
const API_BASE_URL = '/api';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// This runs BEFORE every request is sent
// It reads the token from localStorage and adds it to the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// This runs AFTER every response is received
// If the server returns 401 (unauthorized), clear the token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Students API ─────────────────────────────────────────────────────────────
export const studentsAPI = {
  getMyProfile: () => api.get('/students/profile/me'),
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ─── Teachers API ─────────────────────────────────────────────────────────────
export const teachersAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getById: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// ─── Classes API ──────────────────────────────────────────────────────────────
export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  getByTeacher: (teacherId) => api.get(`/classes/teacher/${teacherId}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  addStudent: (classId, studentId) =>
    api.post(`/classes/${classId}/students`, { studentId }),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),  
  getAll: (params) => api.get('/attendance', { params }),
  getByStudent: (studentId, params) =>
    api.get(`/attendance/student/${studentId}`, { params }),
  getByClass: (classId, params) =>
    api.get(`/attendance/class/${classId}`, { params }),
  getStats: () => api.get('/attendance/stats/overview'),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export default api;
