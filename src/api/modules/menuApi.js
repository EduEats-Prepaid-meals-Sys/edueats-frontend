import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const getMenu = () => apiRequest(endpoints.menu.list);

export const createMenuItem = (body) =>
  apiRequest(endpoints.menu.list, { method: 'POST', body: JSON.stringify(body) });

export const updateMenuItem = (id, body) =>
  apiRequest(endpoints.menu.item(id), { method: 'PUT', body: JSON.stringify(body) });
