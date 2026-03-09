import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const setLimits = (body) =>
  apiRequest(endpoints.limits.set, { method: 'POST', body: JSON.stringify(body) });
