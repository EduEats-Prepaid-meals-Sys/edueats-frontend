import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

// Create a draft order: POST /api/orders/student/create/
// Backend expects: { daily_menu_id, quantity }
export const createOrder = (body) =>
  apiRequest(endpoints.orders.create, { method: 'POST', body: JSON.stringify(body) });

// Checkout a draft order: POST /api/orders/student/checkout/
// Backend expects: { order_id }
export const checkoutOrder = (order_id) =>
  apiRequest(endpoints.orders.checkout, {
    method: 'POST',
    body: JSON.stringify({ order_id }),
  });

// Delete a draft order before checkout
export const deleteDraftOrder = (order_id) =>
  apiRequest(endpoints.orders.deleteDraft(order_id), { method: 'DELETE' });

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
