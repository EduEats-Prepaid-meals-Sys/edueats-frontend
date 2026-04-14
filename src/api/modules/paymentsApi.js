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

const appendQueryParam = (path, key, value) => {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

const openStyledReceiptViewer = (blobUrl, fileName) => {
  const view = window.open('', '_blank', 'noopener,noreferrer,width=1080,height=760');
  if (!view) {
    return false;
  }

  const safeFileName = String(fileName || 'receipt.pdf').replace(/"/g, '&quot;');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt - ${safeFileName}</title>
  <style>
    :root {
      --bg: #f4f7f8;
      --panel: #ffffff;
      --line: #dbe4e8;
      --ink: #1f2937;
      --muted: #64748b;
      --brand: #0f766e;
      --brand-dark: #115e59;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at 15% 10%, #e6fffb 0%, var(--bg) 45%), var(--bg);
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
    }
    .shell {
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr;
      padding: 14px;
      gap: 12px;
    }
    .topbar {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(15, 118, 110, 0.08);
    }
    .title-wrap {
      min-width: 0;
    }
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .subtitle {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 56vw;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .btn {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn.primary {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
    }
    .btn.primary:hover { background: var(--brand-dark); }
    .viewer {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
      min-height: 0;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    }
    iframe {
      border: 0;
      width: 100%;
      height: calc(100vh - 130px);
      background: #fff;
    }
    @media (max-width: 760px) {
      .topbar { flex-direction: column; align-items: flex-start; }
      .subtitle { max-width: 88vw; }
      .actions { width: 100%; justify-content: flex-start; }
      iframe { height: calc(100vh - 198px); }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="title-wrap">
        <h1 class="title">Official EduEats Receipt</h1>
        <p class="subtitle">${safeFileName}</p>
      </div>
      <div class="actions">
        <a class="btn" href="${blobUrl}" download="${safeFileName}">Download PDF</a>
        <button class="btn primary" id="printBtn" type="button">Print</button>
        <button class="btn" id="closeBtn" type="button">Close</button>
      </div>
    </header>
    <main class="viewer">
      <iframe id="pdfFrame" title="Receipt PDF" src="${blobUrl}#view=FitH"></iframe>
    </main>
  </div>
  <script>
    const closeBtn = document.getElementById('closeBtn');
    const printBtn = document.getElementById('printBtn');
    const pdfFrame = document.getElementById('pdfFrame');

    closeBtn?.addEventListener('click', () => window.close());
    printBtn?.addEventListener('click', () => {
      try {
        if (pdfFrame?.contentWindow) {
          pdfFrame.contentWindow.focus();
          pdfFrame.contentWindow.print();
          return;
        }
      } catch (e) {}
      window.print();
    });

    window.addEventListener('beforeunload', () => {
      try { window.opener?.postMessage({ type: 'EDUEATS_RECEIPT_CLOSE' }, '*'); } catch (e) {}
    });
  </script>
</body>
</html>`;

  view.document.open();
  view.document.write(html);
  view.document.close();
  return true;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'Ksh 0.00';
  return `Ksh ${amount.toFixed(2)}`;
};

const normalizeReceiptData = (payload = {}) => {
  const order = payload?.order && typeof payload.order === 'object' ? payload.order : {};
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(order?.items)
      ? order.items
      : [];

  return {
    receiptNumber: payload?.receipt_number ?? payload?.payment_id ?? payload?.id ?? order?.order_id ?? 'N/A',
    orderId: payload?.order_id ?? order?.order_id ?? order?.id ?? 'N/A',
    customer:
      payload?.student_name ??
      payload?.student?.full_name ??
      order?.student_name ??
      order?.student?.full_name ??
      'Student',
    status: payload?.status ?? order?.status ?? 'paid',
    createdAt: payload?.created_at ?? payload?.payment_date ?? order?.created_at ?? null,
    total:
      payload?.total_amount ??
      payload?.amount ??
      order?.total_amount ??
      order?.grand_total ??
      order?.amount ??
      0,
    items,
  };
};

const openReceiptDataViewer = (receiptData, fileName = 'receipt') => {
  const view = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
  if (!view) return false;

  const receipt = normalizeReceiptData(receiptData);
  const safeFileName = escapeHtml(fileName);
  const safeReceiptNo = escapeHtml(receipt.receiptNumber);
  const safeOrderId = escapeHtml(receipt.orderId);
  const safeCustomer = escapeHtml(receipt.customer);
  const safeStatus = escapeHtml(String(receipt.status).toUpperCase());
  const safeCreatedAt = receipt.createdAt
    ? escapeHtml(new Date(receipt.createdAt).toLocaleString())
    : 'N/A';

  const itemRows = (receipt.items.length > 0 ? receipt.items : [{ name: 'Meal Item', quantity: 1, price: receipt.total }])
    .map((item) => {
      const name = escapeHtml(item?.meal_name ?? item?.name ?? 'Meal Item');
      const qty = Number(item?.quantity ?? item?.qty ?? 1);
      const unit = Number(item?.price ?? item?.unit_price ?? 0);
      const lineTotal = qty * unit;
      return `
        <tr>
          <td>${name}</td>
          <td class="num">${Number.isFinite(qty) ? qty : 1}</td>
          <td class="num">${escapeHtml(formatCurrency(unit))}</td>
          <td class="num total">${escapeHtml(formatCurrency(lineTotal))}</td>
        </tr>
      `;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt - ${safeFileName}</title>
  <style>
    :root {
      --bg: #f4f7f8;
      --panel: #ffffff;
      --line: #dbe4e8;
      --ink: #1f2937;
      --muted: #64748b;
      --brand: #0f766e;
      --brand-dark: #115e59;
      --accent: #ea580c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at 15% 10%, #e6fffb 0%, var(--bg) 45%), var(--bg);
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      padding: 16px;
    }
    .topbar {
      max-width: 880px;
      margin: 0 auto 12px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(15, 118, 110, 0.08);
    }
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
    .subtitle {
      margin: 2px 0 0;
      font-size: 12px;
      color: var(--muted);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }
    .btn {
      border: 1px solid var(--line);
      background: #fff;
      color: var(--ink);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
    }
    .btn.primary {
      background: var(--brand);
      color: #fff;
      border-color: var(--brand);
    }
    .btn.primary:hover { background: var(--brand-dark); }
    .receipt {
      max-width: 880px;
      margin: 0 auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }
    .banner {
      padding: 18px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 55%, #fcd34d 100%);
      border-bottom: 1px solid #f3cc55;
    }
    .brand {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.01em;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 10px;
      padding: 18px;
      border-bottom: 1px solid var(--line);
    }
    .meta .label {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--muted);
      letter-spacing: 0.05em;
    }
    .meta .value {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead th {
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      background: #f8fafc;
      border-bottom: 1px solid var(--line);
      padding: 10px 18px;
    }
    tbody td {
      border-bottom: 1px solid #edf2f7;
      padding: 12px 18px;
      font-size: 14px;
    }
    .num { text-align: right; }
    .total { font-weight: 700; }
    .summary {
      padding: 18px;
      display: flex;
      justify-content: flex-end;
    }
    .total-card {
      min-width: 260px;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      background: #f8fafc;
    }
    .total-label {
      font-size: 12px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .total-value {
      margin-top: 6px;
      font-size: 20px;
      font-weight: 800;
      color: var(--accent);
    }
    .footer {
      padding: 14px 18px;
      font-size: 12px;
      color: var(--muted);
      border-top: 1px dashed var(--line);
    }
    @media (max-width: 760px) {
      .topbar { flex-direction: column; align-items: flex-start; }
      .actions { width: 100%; justify-content: flex-start; }
      thead th, tbody td { padding: 10px 12px; }
      .summary { padding: 12px; }
      .total-card { min-width: 100%; }
    }
    @media print {
      body { padding: 0; background: #fff; }
      .topbar { display: none; }
      .receipt { box-shadow: none; border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div>
      <h1 class="title">Official EduEats Receipt</h1>
      <p class="subtitle">${safeFileName}</p>
    </div>
    <div class="actions">
      <button class="btn primary" id="printBtn" type="button">Print / Save PDF</button>
      <button class="btn" id="closeBtn" type="button">Close</button>
    </div>
  </header>

  <main class="receipt">
    <section class="banner">
      <p class="brand">EduEats</p>
      <p style="margin:4px 0 0; color:#6b7280; font-size:13px;">Campus Dining Services</p>
    </section>

    <section class="meta">
      <div><div class="label">Receipt No</div><div class="value">${safeReceiptNo}</div></div>
      <div><div class="label">Order ID</div><div class="value">${safeOrderId}</div></div>
      <div><div class="label">Customer</div><div class="value">${safeCustomer}</div></div>
      <div><div class="label">Status</div><div class="value">${safeStatus}</div></div>
      <div><div class="label">Date</div><div class="value">${safeCreatedAt}</div></div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="num">Qty</th>
          <th class="num">Unit</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <section class="summary">
      <div class="total-card">
        <div class="total-label">Amount Paid</div>
        <div class="total-value">${escapeHtml(formatCurrency(receipt.total))}</div>
      </div>
    </section>

    <section class="footer">
      Thank you for your purchase. This is an official EduEats receipt.
    </section>
  </main>

  <script>
    const closeBtn = document.getElementById('closeBtn');
    const printBtn = document.getElementById('printBtn');
    closeBtn?.addEventListener('click', () => window.close());
    printBtn?.addEventListener('click', () => window.print());
  </script>
</body>
</html>`;

  view.document.open();
  view.document.write(html);
  view.document.close();
  return true;
};

const parseJsonSafe = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const detectTextPayloadType = (text = '') => {
  const value = String(text || '').trim();
  if (!value) return 'empty';
  if (value.startsWith('<!doctype html') || value.startsWith('<html')) return 'html';
  if (value.startsWith('{') || value.startsWith('[')) return 'json';
  return 'unknown';
};

const isLikelyPdfBlob = async (blob) => {
  if (!blob || blob.size < 5) return false;
  try {
    const header = await blob.slice(0, 5).text();
    return header === '%PDF-';
  } catch {
    return false;
  }
};

const downloadReceiptBlob = async (path, fallbackName) => {
  const token = getToken();
  if (!token) {
    const err = new Error('You must be logged in to download receipts.');
    err.status = 401;
    throw err;
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Ask backend for PDF first; we'll gracefully handle HTML/JSON too.
    Accept: 'application/pdf, text/html, application/json;q=0.9, */*;q=0.8',
  };

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

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    const payload = await response.json();
    const opened = openReceiptDataViewer(payload, fallbackName.replace(/\.pdf$/i, '.html'));
    if (!opened) {
      const err = new Error('Popup blocked. Please allow popups to preview your receipt.');
      err.status = 400;
      throw err;
    }
    return;
  }

  if (contentType.includes('text/html')) {
    const html = await response.text();
    const view = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
    if (!view) {
      const err = new Error('Popup blocked. Please allow popups to preview your receipt.');
      err.status = 400;
      throw err;
    }
    view.document.open();
    view.document.write(html);
    view.document.close();
    return;
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    const err = new Error('Receipt file is empty. Please try again or contact support.');
    err.status = 422;
    throw err;
  }

  // Some servers return JSON/HTML bodies while still labeling them as PDF.
  // Validate the file signature so users get a clear error path instead of a blank "PDF".
  const pdfLike = await isLikelyPdfBlob(blob);
  if (!pdfLike) {
    const rawText = await blob.text();
    const payloadType = detectTextPayloadType(rawText);

    if (payloadType === 'json') {
      const payload = parseJsonSafe(rawText) ?? { detail: rawText };
      const opened = openReceiptDataViewer(payload, fallbackName.replace(/\.pdf$/i, '.html'));
      if (opened) return;
      const err = new Error('Receipt response was JSON and popup was blocked.');
      err.status = 400;
      throw err;
    }

    if (payloadType === 'html') {
      const view = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
      if (!view) {
        const err = new Error('Receipt response was HTML and popup was blocked.');
        err.status = 400;
        throw err;
      }
      view.document.open();
      view.document.write(rawText);
      view.document.close();
      return;
    }

    const err = new Error(
      `Receipt response is not a valid PDF (content-type: ${contentType || 'unknown'}, size: ${blob.size} bytes).`
    );
    err.status = 422;
    throw err;
  }

  // The backend PDF is valid; avoid embedding it in an iframe/webview because some mobile/browser
  // PDF renderers display handcrafted PDFs blank even when the bytes are correct.
  const fileName = filenameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackName
  );

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'PDF receipt',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // If the user cancels or the API fails, fall back to standard download below.
      if (err?.name !== 'AbortError') {
        // continue to fallback download
      } else {
        return;
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const fallbackLink = document.createElement('a');
  fallbackLink.href = url;
  fallbackLink.download = fileName;
  fallbackLink.rel = 'noopener noreferrer';
  document.body.appendChild(fallbackLink);
  fallbackLink.click();
  document.body.removeChild(fallbackLink);

  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

const normalizeList = (payload) =>
  (Array.isArray(payload) ? payload : payload?.results ?? payload?.payments ?? []);

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    query.append(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
};

export const getStudentPaymentHistory = async () => {
  const response = await apiRequest(endpoints.payments.studentHistory);
  return normalizeList(response);
};

export const getStaffPayments = async ({ paymentType, startDate, endDate } = {}) => {
  const response = await apiRequest(
    `${endpoints.payments.staffAll}${buildQuery({
      payment_type: paymentType,
      start_date: startDate,
      end_date: endDate,
    })}`
  );
  return normalizeList(response);
};

export const getStaffPaymentSummary = ({ startDate, endDate } = {}) =>
  apiRequest(
    `${endpoints.payments.staffSummary}${buildQuery({
      start_date: startDate,
      end_date: endDate,
    })}`
  );

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
