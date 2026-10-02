import axios from 'axios';

// By using a relative URL, the Vite proxy will intercept this and 
// route it to http://localhost:8080/journal without CORS issues!
const API_BASE_URL = '/journal';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  login: (credentials) => apiClient.post('/public/login', credentials),
  signup: (userData) => apiClient.post('/public/signup', userData),
  googleLogin: (code) => apiClient.get('/auth/google/callback', { params: { code } }),
  healthCheck: () => apiClient.get('/public/health-check'),
  getProfile: () => apiClient.get('/profile'),
  getGreeting: () => apiClient.get('/user/greeting'),
  getAllJournals: () => apiClient.get('/journal'),
  createJournal: (data) => apiClient.post('/journal/create-entry', data),
  getJournalById: (id) => apiClient.get(`/journal/id?myId=${id}`),
  updateJournal: (id, data) => apiClient.put(`/journal/id?myId=${id}`, data),
  deleteJournal: (id) => apiClient.delete(`/journal/id?myId=${id}`),
  deleteAccount: () => apiClient.delete('/user'),
};

export default api;
