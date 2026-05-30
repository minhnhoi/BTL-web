import axios from 'axios';
import { getAuthToken, clearAuthData } from '../utils/storage';

// Frontend luôn gọi đúng backend API dù .env được nhập là:
// http://localhost:5000 hoặc http://localhost:5000/api
function resolveApiBaseUrl() {
  const configuredUrl = String(
    process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  ).trim();

  const urlWithoutTrailingSlash = configuredUrl.replace(/\/+$/, '');
  return /\/api$/i.test(urlWithoutTrailingSlash)
    ? urlWithoutTrailingSlash
    : `${urlWithoutTrailingSlash}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && window.location.pathname !== '/login') {
      clearAuthData();
    }
    return Promise.reject(error);
  },
);

export function getApiError(error, fallback = 'Không thể kết nối tới server.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
