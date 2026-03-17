/**
 * Generate and download a receipt for a completed order
 * @param {Object} order - Order object with id, items, total, created_at, status
 * @param {String} studentName - Name of the student who made the order
 */
export const downloadReceipt = (order, studentName = 'Student') => {
  if (!order) {
    console.error('No order provided for receipt generation');
    return;
  }

  // Generate receipt content
  const receiptContent = generateReceiptContent(order, studentName);

  // Create blob and download
  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `receipt_order_${order.id}_${new Date().toISOString().split('T')[0]}.txt`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Generate formatted receipt content as text
 * @param {Object} order - Order object
 * @param {String} studentName - Name of the student
 * @returns {String} Formatted receipt text
 */
const generateReceiptContent = (order, studentName) => {
  const lineWidth = 50;
  const line = '='.repeat(lineWidth);
  const line2 = '-'.repeat(lineWidth);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-KE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const padRight = (str, len) => String(str).padEnd(len);
  const padLeft = (str, len) => String(str).padStart(len);

  let receipt = `${line}
                    EDUEATS RECEIPT
${line}

Student Name: ${studentName}
Order ID: ${order.id}
Date: ${formatDate(order.created_at)}
Status: ${String(order.status || 'Pending').toUpperCase()}

${line2}
ITEMS
${line2}
`;

  // Add items if available
  if (order.items && Array.isArray(order.items)) {
    receipt += order.items
      .map((item) => {
        const name = (item.meal_name || item.name || 'Item').substring(0, 30);
        const qty = item.quantity || 1;
        const unitPrice = Number(item.price || 0);
        const itemTotal = unitPrice * qty;

        const qtyStr = `Qty: ${qty}`;
        const priceStr = `Ksh ${itemTotal.toFixed(2)}`;

        return `${padRight(name, 30)} ${padLeft(qtyStr, 10)}\n${padLeft(priceStr, 40)}`;
      })
      .join('\n\n');

    receipt += `\n\n`;
  } else if (order.meals && Array.isArray(order.meals)) {
    // Alternative meals structure
    receipt += order.meals
      .map((meal) => {
        const name = (meal.name || 'Item').substring(0, 30);
        const qty = meal.quantity || 1;
        const unitPrice = Number(meal.price || 0);
        const itemTotal = unitPrice * qty;

        const qtyStr = `Qty: ${qty}`;
        const priceStr = `Ksh ${itemTotal.toFixed(2)}`;

        return `${padRight(name, 30)} ${padLeft(qtyStr, 10)}\n${padLeft(priceStr, 40)}`;
      })
      .join('\n\n');

    receipt += `\n\n`;
  }

  receipt += `${line2}
PAYMENT SUMMARY
${line2}
`;

  // Calculate totals
  const subtotal = Number(order.subtotal || order.total || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || order.amount || 0);

  receipt += `Subtotal: ${padLeft(`Ksh ${subtotal.toFixed(2)}`, 35)}
Tax (if any): ${padLeft(`Ksh ${tax.toFixed(2)}`, 30)}
${line2}
TOTAL: ${padLeft(`Ksh ${total.toFixed(2)}`, 38)}
${line}

Order Status: ${String(order.status || 'Pending').toUpperCase()}
${order.notes ? `Notes: ${order.notes}\n` : ''}

Thank you for ordering with EduEats!
For support, contact: support@edueats.local

${line}
Receipt generated on ${new Date().toLocaleString('en-KE')}
`;

  return receipt;
};

/**
 * Check if an order can be downloaded (must be approved/completed)
 * @param {Object} order - Order object
 * @returns {Boolean} Whether the order can be downloaded
 */
export const canDownloadReceipt = (order) => {
  if (!order) return false;

  const downloadableStatuses = ['approved', 'completed', 'paid', 'delivered', 'ready'];
  const status = String(order.status || '').toLowerCase();

  return downloadableStatuses.includes(status);
};
