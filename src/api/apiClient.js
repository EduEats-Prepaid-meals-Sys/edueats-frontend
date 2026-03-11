import { getToken, clearToken } from '../auth/tokenStore.js';
import { WALLET_TOPUP_PATH } from './endpoints.js';

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

let onUnauthorized = null;
let mockUserState = { balance: 800, spentToday: 200, dailyLimit: 500 };

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const setMockUserState = (state) => {
  mockUserState = { ...mockUserState, ...state };
};

export const getMockUserForRole = (role) => {
  const base = {
    student: { name: 'Dev Student', email: 'dev@test', wallet_balance: 800, balance: 800, daily_limit: 500 },
    staff: { name: 'Dev Staff', email: 'staff@test' },
    admin: { name: 'Dev Admin', email: 'admin@test' },
  };
  return { ...base[role] };
};

const MOCK_MENU = [
  { id: 1, name: 'Ugali + Beef', price: 150, meal_type: 'lunch', available: true },
  { id: 2, name: 'Rice + Chicken Stew', price: 150, meal_type: 'lunch', available: true },
  { id: 3, name: 'Chapati + Beans', price: 80, meal_type: 'lunch', available: true },
  { id: 4, name: 'Pilau', price: 100, meal_type: 'lunch', available: false },
  { id: 5, name: 'Mandazi', price: 30, meal_type: 'breakfast', available: true },
  { id: 6, name: 'Uji', price: 50, meal_type: 'breakfast', available: true },
  { id: 7, name: 'Eggs + Toast', price: 120, meal_type: 'breakfast', available: true },
  { id: 8, name: 'Matumbo', price: 130, meal_type: 'dinner', available: true },
  { id: 9, name: 'Fish + Ugali', price: 180, meal_type: 'dinner', available: true },
  { id: 10, name: 'Beans + Rice', price: 70, meal_type: 'dinner', available: true },
];

const MOCK_ORDERS_HISTORY = [
  { id: 101, total: 150, status: 'finished', created_at: '2025-03-04T10:30:00Z' },
  { id: 102, total: 230, status: 'finished', created_at: '2025-03-04T12:15:00Z' },
  { id: 103, total: 80, status: 'finished', created_at: '2025-03-03T08:00:00Z' },
  { id: 104, total: 300, status: 'finished', created_at: '2025-03-03T13:00:00Z' },
  { id: 105, total: 150, status: 'finished', created_at: '2025-03-02T11:45:00Z' },
];

const MOCK_LIVE_ORDERS = [
  { id: 201, meal_name: 'Ugali Beef', total: 150, total_orders: 10, status: 'paid' },
  { id: 202, meal_name: 'Pilau', total: 100, total_orders: 6, status: 'paid' },
  { id: 203, meal_name: 'Rice + Chicken', total: 150, total_orders: 4, status: 'paid' },
  { id: 204, meal_name: 'Chapati + Beans', total: 80, total_orders: 8, status: 'paid' },
  { id: 205, meal_name: 'Mandazi', total: 30, total_orders: 12, status: 'paid' },
  { id: 206, meal_name: 'Uji', total: 50, total_orders: 5, status: 'paid' },
];

const MOCK_REPORTS_PERSONAL = { total_spent: 910, orders_count: 5 };
const MOCK_REPORTS_MESS = {
  revenue_today: 2100,
  total_orders: 16,
  ranking: [
    { id: 1, name: 'Ugali', count: 30 },
    { id: 2, name: 'Chapati', count: 25 },
    { id: 3, name: 'Pilau', count: 20 },
    { id: 4, name: 'Uji', count: 15 },
    { id: 5, name: 'Matumbo', count: 12 },
  ],
};

const mockNormalizedError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  err.message = message;
  err.details = null;
  return err;
};

const mockMatch = (method, path, body) => {
  if (path === '/auth/login/' && method === 'POST') {
    const role = body?.staff_id ? 'staff' : body?.email?.includes('admin') ? 'admin' : 'student';
    const user = getMockUserForRole(role);
    const roles = role === 'student' ? ['student'] : role === 'staff' ? ['staff'] : ['admin'];
    return Promise.resolve({ access: `mock_${role}`, token: `mock_${role}`, user, roles });
  }
  if (path === '/auth/register/' && method === 'POST') {
    const user = getMockUserForRole('student');
    return Promise.resolve({ access: 'mock_student', token: 'mock_student', user, roles: ['student'] });
  }
  if (path === '/users/me/' && method === 'GET') {
    const token = getToken();
    if (!token) return Promise.reject(mockNormalizedError(401, 'Unauthorized'));
    let role = 'student';
    if (token.includes('staff')) role = 'staff';
    else if (token.includes('admin')) role = 'admin';
    const user = getMockUserForRole(role);
    const roles = role === 'student' ? ['student'] : role === 'staff' ? ['staff'] : ['admin'];
    return Promise.resolve({ user, roles });
  }
  if (path === '/menu/' && method === 'GET') {
    return Promise.resolve(MOCK_MENU);
  }
  if (path.match(/^\/menu\/\d+\/$/) && method === 'GET') {
    const id = parseInt(path.match(/\d+/)[0]);
    const item = MOCK_MENU.find(m => m.id === id);
    if (item) return Promise.resolve(item);
    return Promise.reject(mockNormalizedError(404, 'Menu item not found'));
  }
  if (path === '/orders/history/' && method === 'GET') {
    return Promise.resolve(MOCK_ORDERS_HISTORY);
  }
  if (path === '/orders/live/' && method === 'GET') {
    return Promise.resolve(MOCK_LIVE_ORDERS);
  }
  if (path === '/orders/' && method === 'POST') {
    let total = 0;
    try {
      const items = body?.items ?? [];
      items.forEach(({ menu_item_id, quantity }) => {
        const m = MOCK_MENU.find((x) => x.id === menu_item_id);
        if (m) total += m.price * (quantity || 1);
      });
    } catch {}
    if (total > mockUserState.balance) {
      return Promise.reject(mockNormalizedError(402, 'Insufficient wallet balance'));
    }
    if (mockUserState.spentToday + total > mockUserState.dailyLimit) {
      return Promise.reject(mockNormalizedError(403, 'Daily spending limit exceeded'));
    }
    return Promise.resolve({ id: 999, total, status: 'paid' });
  }
  if (path.startsWith('/orders/') && path.endsWith('/status/') && method === 'PATCH') {
    return Promise.resolve(null);
  }
  if (path === '/limits/' && method === 'POST') {
    return Promise.resolve({ ok: true });
  }
  if (path === '/reports/personal/' && method === 'GET') {
    return Promise.resolve(MOCK_REPORTS_PERSONAL);
  }
  if (path === '/reports/mess/' && method === 'GET') {
    return Promise.resolve(MOCK_REPORTS_MESS);
  }
  if (path === WALLET_TOPUP_PATH && method === 'POST') {
    return Promise.resolve({ ok: true });
  }
  if (path === '/users/me/' && method === 'PUT') {
    return Promise.resolve(body ?? {});
  }
  if (path === '/menu/' && method === 'POST') {
    return Promise.resolve({ id: 99, ...body });
  }
  if (path.match(/^\/menu\/\d+\/$/) && method === 'PUT') {
    return Promise.resolve({ id: 1, ...body });
  }
  return null;
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
  const message = payload?.message || payload?.detail || payload?.error || 'Something went wrong. Please try again.';
  const details = payload && typeof payload === 'object' ? payload : null;
  return { status, message, details };
};

const realApiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(buildUrl(path), { ...options, headers });

  if (!response.ok) {
    const error = await normalizeError(response);
    if (error.status === 401) {
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
  if (IS_MOCK) {
    const method = (options.method || 'GET').toUpperCase();
    let body = null;
    try {
      body = options.body ? JSON.parse(options.body) : null;
    } catch {}
    const result = mockMatch(method, path, body);
    if (result) return result;
    return Promise.reject(mockNormalizedError(404, 'Mock endpoint not implemented'));
  }

  return realApiRequest(path, options);
};
