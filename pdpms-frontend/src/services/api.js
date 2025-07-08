import axios from 'axios';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - please login');
    }
    return Promise.reject(error);
  }
);



// Dashboard endpoints
export const dashboardAPI = {
  getDocumentStatus: () => api.get('/pdpms/dashboard/document-status/'),
  getPropertyStatus: () => api.get('/pdpms/dashboard/property-status/')
};

export default api;
