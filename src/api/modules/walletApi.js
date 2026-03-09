import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const topUp = (body) =>
  apiRequest(endpoints.wallet.topup, { method: 'POST', body: JSON.stringify(body) });
