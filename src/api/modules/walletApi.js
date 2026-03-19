import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

export const topUp = (body) =>
  apiRequest(endpoints.wallet.topup, { method: 'POST', body: JSON.stringify(body) });

export const getBalanceDetails = async () => {
  const payload = await apiRequest(endpoints.wallet.balance);
  return {
    wallet_balance: payload?.wallet_balance ?? payload?.balance ?? 0,
    minimum_order_balance: payload?.minimum_order_balance ?? 0,
    can_order: Boolean(payload?.can_order ?? true),
    message: payload?.message ?? null,
  };
};

export const getTopUpHistory = () => apiRequest(endpoints.wallet.topupHistory);

export const getStaffTopups = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.acknowledged !== undefined) {
    query.set('acknowledged', params.acknowledged ? 'true' : 'false');
  }
  const path =
    query.toString().length > 0
      ? `${endpoints.wallet.staffTopups}?${query.toString()}`
      : endpoints.wallet.staffTopups;
  const payload = await apiRequest(path);
  return Array.isArray(payload) ? payload : payload?.results ?? [];
};

export const acknowledgeTopup = (topupId, acknowledged) =>
  apiRequest(endpoints.wallet.staffTopupAcknowledge(topupId), {
    method: 'POST',
    body: JSON.stringify({ acknowledged: Boolean(acknowledged) }),
  });
