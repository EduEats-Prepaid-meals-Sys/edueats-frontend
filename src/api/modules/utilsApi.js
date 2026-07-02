import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

/** GET /utils/app-info/ — returns general app metadata (may require auth on some backends) */
export const getAppInfo = () => apiRequest(endpoints.utils.appInfo);

/** GET /utils/dashboard-summary/ — returns today's totals (may require auth on some backends) */
export const getDashboardSummary = () => apiRequest(endpoints.utils.dashboardSummary);
