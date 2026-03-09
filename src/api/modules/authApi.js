import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const register = (body) =>
  apiRequest(endpoints.auth.register, { method: 'POST', body: JSON.stringify(body) });

export const login = (body) =>
  apiRequest(endpoints.auth.login, { method: 'POST', body: JSON.stringify(body) });

export const getMe = () => apiRequest(endpoints.users.me);

export const updateMe = (body) =>
  apiRequest(endpoints.users.me, { method: 'PUT', body: JSON.stringify(body) });
