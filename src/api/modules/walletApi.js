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

// --- NEW FUNCTION TO HANDLE THE M-PESA DELAY ---

/**
 * Polls the top-up history looking for a specific transaction to complete.
 * @param {string} transactionRef - The reference returned by the initial topUp call.
 * @param {number} maxAttempts - How many times to check before giving up.
 * @param {number} intervalMs - Milliseconds between checks.
 */
export const pollTopUpStatus = async (transactionRef, maxAttempts = 15, intervalMs = 4000) => {
  for (let i = 0; i < maxAttempts; i++) {
    // Wait for the specified interval (e.g., 4 seconds) before checking
    await new Promise(resolve => setTimeout(resolve, intervalMs));

    const history = await getTopUpHistory();
    
    // Find the specific transaction we are waiting for
    const transaction = history.find(t => t.transaction_ref === transactionRef);

    if (transaction) {
      if (transaction.status === 'completed') {
        return { success: true, transaction };
      }
      if (transaction.status === 'failed') {
        return { success: false, error: 'The M-Pesa payment failed or was cancelled.' };
      }
      // If it's still 'pending', loop continues and it checks again
    }
  }

  return { 
    success: false, 
    error: 'We have not received the confirmation yet. Your balance will update automatically once M-Pesa processes it.' 
  };
};
