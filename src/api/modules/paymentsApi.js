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

const openStyledReceiptViewer = (blobUrl, fileName) => {
  const view = window.open('', '_blank', 'noopener,noreferrer,width=1080,height=760');
  if (!view) {
    // Popup blocked: fallback to direct download link behavior.
    const fallbackLink = document.createElement('a');
    fallbackLink.href = blobUrl;
    fallbackLink.download = fileName;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
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

const downloadReceiptBlob = async (path, fallbackName) => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

  const blob = await response.blob();
  const fileName = filenameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackName
  );

  const url = URL.createObjectURL(blob);
  const opened = openStyledReceiptViewer(url, fileName);

  // Keep blob alive while the viewer is open; fallback path can be released quickly.
  if (!opened) {
    URL.revokeObjectURL(url);
    return;
  }

  const onMessage = (event) => {
    if (event?.data?.type !== 'EDUEATS_RECEIPT_CLOSE') return;
    URL.revokeObjectURL(url);
    window.removeEventListener('message', onMessage);
  };

  window.addEventListener('message', onMessage);

  // Safety cleanup in case beforeunload message is blocked.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    window.removeEventListener('message', onMessage);
  }, 5 * 60 * 1000);
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
