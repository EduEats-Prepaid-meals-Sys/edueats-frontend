import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const getPersonalReport = () => apiRequest(endpoints.reports.personal);

export const getMessReport = () => apiRequest(endpoints.reports.mess);
