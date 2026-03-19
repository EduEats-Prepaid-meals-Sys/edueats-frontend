import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentPaymentHistory } from '../../../api/modules/paymentsApi.js';
import { downloadReceipt, canDownloadReceipt } from '../../../utils/receiptUtils.js';
import { useToast } from '../../../App.jsx';
import Card from '../../../components/Card.jsx';
import { FiDownload } from 'react-icons/fi';

const isOrderPayment = (payment) => {
  if (!payment || typeof payment !== 'object') return false;

  const kind = String(
    payment?.type ?? payment?.payment_type ?? payment?.category ?? payment?.reason ?? ''
  ).toLowerCase();

  if (kind.includes('topup') || kind.includes('deposit') || kind.includes('credit')) return false;
  if (kind.includes('order') || kind.includes('meal') || kind.includes('checkout') || kind.includes('purchase')) {
    return true;
  }

  return Boolean(payment?.order_id ?? payment?.order?.id ?? payment?.order);
};

const getPaymentIdentifier = (payment, index) =>
  payment?.payment_id ?? payment?.id ?? payment?.reference ?? payment?.created_at ?? `payment-${index}`;

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentPaymentHistory()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setPayments(list.filter(isOrderPayment));
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/student/home', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Orders</h1>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : payments.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No order payments yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {payments.map((payment, index) => {
              const paymentId = getPaymentIdentifier(payment, index);
              return (
              <Card key={paymentId} className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-edueats-text">Payment #{paymentId}</p>
                  <p className="text-xs text-edueats-textMuted">
                    {payment.created_at ? new Date(payment.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-edueats-text">Ksh {payment.total_amount ?? payment.amount ?? payment.total ?? '-'}</p>
                  <span className="text-xs text-edueats-textMuted">{payment.status ?? 'paid'}</span>
                </div>
                {canDownloadReceipt(payment) && (
                  <button
                    onClick={async () => {
                      try {
                        await downloadReceipt(payment, { actor: 'student' });
                      } catch (err) {
                        setToast(err?.message ?? 'Failed to download receipt', 'error');
                      }
                    }}
                    className="ml-3 flex items-center gap-1 px-2 py-1 text-xs font-medium text-edueats-accent hover:bg-edueats-surface rounded transition-colors"
                    title="Download official receipt"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                )}
              </Card>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
