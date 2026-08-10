import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const submitCodeReview = async (code, language, model, modes = []) => {
  const response = await api.post('/review', { code, language, model, modes });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const submitQuestion = async (question, model) => {
  const response = await api.post('/ask', { question, model });
  return response.data;
};

export const getQnaHistory = async () => {
  const response = await api.get('/ask/history');
  return response.data;
};

export const getQnaById = async (id) => {
  const response = await api.get(`/ask/history/${id}`);
  return response.data;
};

export const getConvertHistory = async () => {
  const response = await api.get('/convert/history');
  return response.data;
};

export const getConvertById = async (id) => {
  const response = await api.get(`/convert/history/${id}`);
  return response.data;
};
