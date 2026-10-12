import axios from 'axios';

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const apiBase = apiOrigin.endsWith('/api') ? apiOrigin : `${apiOrigin}/api`;

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
export function setAccessToken(token) { accessToken = token; }
api.interceptors.request.use((request) => {
  if (accessToken) request.headers.Authorization = `Bearer ${accessToken}`;
  return request;
});

api.interceptors.response.use((response) => response, async (error) => {
  const request = error.config;
  const expired = error.response?.status === 401 && error.response?.data?.message === 'Access token expired';
  if (!request || request._retried || !expired || request.url?.includes('/auth/refresh')) return Promise.reject(error);
  request._retried = true;
  try {
    const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
    setAccessToken(data.data.accessToken);
    request.headers.Authorization = `Bearer ${data.data.accessToken}`;
    return api(request);
  } catch (refreshError) {
    setAccessToken(null);
    return Promise.reject(refreshError);
  }
});
