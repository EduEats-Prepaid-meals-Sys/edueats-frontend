import {
  downloadStaffPaymentReceipt,
  downloadStudentPaymentReceipt,
} from '../api/modules/paymentsApi.js';

export const getOrderId = (order, fallback = 'N/A') =>
  order?.order_id ?? order?.id ?? order?.payment_id ?? fallback;

export const getOrderAmount = (order) =>
  Number(order?.total_amount ?? order?.total ?? order?.amount ?? order?.grand_total ?? 0);

export const getPaymentId = (order) =>
  order?.payment_id ?? order?.payment?.payment_id ?? order?.payment?.id ?? order?.id ?? null;

export const getStudentName = (order, fallback = 'Student') =>
  order?.student_name ??
  order?.student_full_name ??
  order?.student?.full_name ??
  order?.student?.name ??
  order?.student?.username ??
  order?.student_display_name ??
  fallback;

export const getOrderItems = (order) => {
  if (Array.isArray(order?.items) && order.items.length > 0) {
    return order.items.map((item, index) => ({
      id: item.id ?? `${item.name ?? item.meal_name ?? 'item'}-${index}`,
      name: item.meal_name ?? item.name ?? 'Meal item',
      quantity: Number(item.quantity ?? item.qty ?? 1),
      unitPrice: Number(item.price ?? item.unit_price ?? 0),
    }));
  }

  const fallbackName = order?.meal_name ?? order?.meal?.name ?? 'Meal item';
  const fallbackQty = Number(order?.quantity ?? 1);
  const amount = getOrderAmount(order);
  const unit = fallbackQty > 0 ? amount / fallbackQty : amount;

  return [
    {
      id: 'single-item',
      name: fallbackName,
      quantity: fallbackQty,
      unitPrice: Number.isFinite(unit) ? unit : 0,
    },
  ];
};

export const downloadReceipt = async (order, options = {}) => {
  if (!order) return;

  const actor =
    typeof options === 'string'
      ? 'student'
      : options?.actor === 'staff'
        ? 'staff'
        : 'student';

  const paymentId = getPaymentId(order);
  if (!paymentId) {
    const err = new Error('Payment reference is missing for this transaction.');
    err.status = 400;
    throw err;
  }

  if (actor === 'staff') {
    await downloadStaffPaymentReceipt(paymentId);
    return;
  }

  await downloadStudentPaymentReceipt(paymentId);
};

/**
 * Check if an order can be downloaded (must be approved/completed)
 * @param {Object} order - Order object
 * @returns {Boolean} Whether the order can be downloaded
 */
export const canDownloadReceipt = (order) => {
  if (!order) return false;

  const downloadableStatuses = ['approved', 'completed', 'paid', 'delivered', 'ready', 'served'];
  const status = String(order.status || '').toLowerCase();
  const hasPaymentId = Boolean(getPaymentId(order));

  return hasPaymentId && downloadableStatuses.includes(status);
};
