import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory } from '../../../api/modules/ordersApi.js';
import { downloadReceipt, canDownloadReceipt } from '../../../utils/receiptUtils.js';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Card from '../../../components/Card.jsx';
import { FiDownload } from 'react-icons/fi';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderHistory()
      .then((data) => setOrders(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/student/home" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Orders</h1>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : orders.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No orders yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o.id} className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-edueats-text">Order #{o.id}</p>
                  <p className="text-xs text-edueats-textMuted">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-edueats-text">Ksh {o.total ?? o.amount ?? '-'}</p>
                  <span className="text-xs text-edueats-textMuted">{o.status ?? ''}</span>
                </div>
                {canDownloadReceipt(o) && (
                  <button
                    onClick={() => downloadReceipt(o, user?.name || user?.username || 'Student')}
                    className="ml-3 flex items-center gap-1 px-2 py-1 text-xs font-medium text-edueats-accent hover:bg-edueats-surface rounded transition-colors"
                    title="Download receipt"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
