import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderHistory } from '../../../api/modules/ordersApi.js';
import Card from '../../../components/Card.jsx';

export default function TransactionsPage() {
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
                <div>
                  <p className="font-medium text-edueats-text">Order #{o.id}</p>
                  <p className="text-xs text-edueats-textMuted">
                    {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-edueats-text">Ksh {o.total ?? o.amount ?? '-'}</p>
                  <span className="text-xs text-edueats-textMuted">{o.status ?? ''}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
