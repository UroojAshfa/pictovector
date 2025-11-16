import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds Clerk token to Authorization header
// Token will be added dynamically when making requests from components
api.interceptors.request.use(
  async (config) => {
    // Token will be added by components using useAuth hook
    // This prevents errors during initial app load
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - user needs to sign in');
      // Clerk will handle redirect to sign-in if needed
    }
    return Promise.reject(error);
  }
);

export const imagesAPI = {
  upload: (formData, config = {}) => {
    return api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },
  getAll: (params, config = {}) => api.get('/images', { params, ...config }),
  getById: (id, config = {}) => api.get(`/images/${id}`, config),
  delete: (id, config = {}) => api.delete(`/images/${id}`, config),
};

export const searchAPI = {
  search: (query, params = {}, config = {}) => {
    const searchParams = typeof params === 'object' && !params.headers 
      ? { params: { query, ...params } }
      : { params: { query } };
    return api.get('/search', { ...searchParams, ...config });
  },
  getTags: (config = {}) => api.get('/tags', config),
};

export default api;