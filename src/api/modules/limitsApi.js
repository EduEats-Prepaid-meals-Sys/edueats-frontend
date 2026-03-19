import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const setLimits = (body) =>
  apiRequest(endpoints.wallet.limitsMe, { method: 'PATCH', body: JSON.stringify(body) });

export const getMyLimits = () => apiRequest(endpoints.wallet.limitsMe);
