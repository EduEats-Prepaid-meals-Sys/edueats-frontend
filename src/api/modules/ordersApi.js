import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const createOrder = (body) =>
  apiRequest(endpoints.orders.create, { method: 'POST', body: JSON.stringify(body) });

export const getLiveOrders = () => apiRequest(endpoints.orders.live);

export const getOrderHistory = () => apiRequest(endpoints.orders.history);

export const updateOrderStatus = (id, status) =>
  apiRequest(endpoints.orders.status(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
