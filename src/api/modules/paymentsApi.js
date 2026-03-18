import { getToken } from '../../auth/tokenStore.js';
import { endpoints } from '../endpoints.js';
import { apiRequest } from '../apiClient.js';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const buildUrl = (path) => {
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is not configured');
  return `${baseUrl.replace(/\/$/, '')}${path}`;
};

const filenameFromDisposition = (header, fallback) => {
  if (!header) return fallback;
  const utf = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf?.[1]) return decodeURIComponent(utf[1]);
  const ascii = header.match(/filename="?([^";]+)"?/i);
  return ascii?.[1] ?? fallback;
};

const downloadReceiptBlob = async (path, fallbackName) => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(buildUrl(path), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let message = 'Failed to download receipt';
    try {
      const payload = await response.json();
      message = payload?.detail || payload?.message || payload?.error || message;
    } catch {
      // keep default message
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const blob = await response.blob();
  const fileName = filenameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackName
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizeList = (payload) =>
  (Array.isArray(payload) ? payload : payload?.results ?? payload?.payments ?? []);

export const getStudentPaymentHistory = async () => {
  const response = await apiRequest(endpoints.payments.studentHistory);
  return normalizeList(response);
};

export const getStaffPayments = async () => {
  const response = await apiRequest(endpoints.payments.staffAll);
  return normalizeList(response);
};

export const getStaffPaymentSummary = () => apiRequest(endpoints.payments.staffSummary);

export const downloadStudentPaymentReceipt = (paymentId) =>
  downloadReceiptBlob(
    endpoints.payments.studentReceipt(paymentId),
    `student-payment-receipt-${paymentId}.pdf`
  );

export const downloadStaffPaymentReceipt = (paymentId) =>
  downloadReceiptBlob(
    endpoints.payments.staffReceipt(paymentId),
    `staff-payment-receipt-${paymentId}.pdf`
  );
