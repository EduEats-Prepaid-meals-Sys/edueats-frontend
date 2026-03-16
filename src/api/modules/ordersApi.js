import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const createOrder = (body) =>
  apiRequest(endpoints.orders.create, { method: 'POST', body: JSON.stringify(body) });

const normalizeOrdersList = (payload) =>
  (Array.isArray(payload) ? payload : payload?.results ?? payload?.orders ?? []);

export const getLiveOrders = async () => {
  const response = await apiRequest(endpoints.orders.live);
  return normalizeOrdersList(response);
};

export const getOrderHistory = async () => {
  const response = await apiRequest(endpoints.orders.history);
  return normalizeOrdersList(response);
};

export const updateOrderStatus = (id, status) =>
  apiRequest(endpoints.orders.status(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
