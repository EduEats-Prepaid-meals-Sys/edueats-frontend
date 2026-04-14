import { getToken, clearToken } from '../auth/tokenStore.js';

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const buildUrl = (path) => {
  if (!baseUrl) throw new Error('VITE_API_BASE_URL is not configured');
  return `${baseUrl.replace(/\/$/, '')}${path}`;
};

const normalizeError = async (response) => {
  const { status } = response;
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const toSentence = (text) =>
    String(text || '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const readableField = (field) => {
    const key = String(field || '').toLowerCase();
    if (key === 'non_field_errors' || key === 'detail') return '';
    if (key === 'email') return 'Email';
    if (key === 'username') return 'Username';
    if (key === 'staff_id') return 'Staff ID';
    if (key === 'password') return 'Password';
    if (key.includes('wallet') || key.includes('balance')) return 'Wallet';
    if (key.includes('limit')) return 'Spending limit';
    return toSentence(field).replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const collectMessages = (data) => {
    if (!data || typeof data !== 'object') return [];

    const list = [];
    for (const [field, value] of Object.entries(data)) {
      if (value == null) continue;
      const prefix = readableField(field);
      if (Array.isArray(value)) {
        for (const entry of value) {
          const msg = toSentence(entry);
          if (!msg) continue;
          list.push(prefix ? `${prefix}: ${msg}` : msg);
        }
      } else if (typeof value === 'string') {
        const msg = toSentence(value);
        if (!msg) continue;
        list.push(prefix ? `${prefix}: ${msg}` : msg);
      }
    }
    return list;
  };

  let rawMessages = [];
  if (payload && typeof payload === 'object') {
    rawMessages = collectMessages(payload);
  }

  const derivedMessage = rawMessages.length > 0 ? rawMessages.slice(0, 3).join(' | ') : null;

  const message =
    payload?.message ||
    payload?.detail ||
    payload?.error ||
    derivedMessage ||
    (status === 401 ? 'Wrong email/username/staff ID or password.' : null) ||
    (status === 402 ? 'Insufficient wallet balance.' : null) ||
    (status === 403 ? 'You have reached your maximum spending limit.' : null) ||
    'Something went wrong. Please try again.';

  // Store raw message list so mapApiError() can pattern-match individual messages
  if (rawMessages.length === 0 && message) rawMessages = [message];

  const details = payload && typeof payload === 'object' ? payload : null;
  return { status, message, rawMessages, details };
};

const realApiRequest = async (path, options = {}) => {
  const token = getToken();
  const isFormDataBody =
    typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  const hasContentType = Object.keys(headers).some((k) => k.toLowerCase() === 'content-type');

  // Allow callers (like login forms) to opt out of global 401 redirect behavior.
  const shouldHandleUnauthorized = options?.handleUnauthorized !== false && Boolean(token);

  // Keep fetch options clean (handleUnauthorized is internal-only).
  const { handleUnauthorized: _handleUnauthorized, ...fetchOptions } = options;

  // Let the browser set multipart boundary for FormData requests.
  if (!isFormDataBody && !hasContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path), { ...fetchOptions, headers });

  if (!response.ok) {
    const error = await normalizeError(response);
    if (error.status === 401 && shouldHandleUnauthorized) {
      clearToken();
      if (typeof onUnauthorized === 'function') onUnauthorized(error);
    }
    throw error;
  }

  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const apiRequest = async (path, options = {}) => {
  return realApiRequest(path, options);
};
