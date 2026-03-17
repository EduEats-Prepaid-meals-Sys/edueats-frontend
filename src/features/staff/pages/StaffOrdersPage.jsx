import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLiveOrders, updateOrderStatus } from '../../../api/modules/ordersApi.js';
import { useToast } from '../../../App.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';

const POLL_INTERVAL_MS = 12000;
const STATUS_FINISHED = 'completed';

export default function StaffOrdersPage() {
  const { setToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [closedOrders, setClosedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState('active');

  const fetchOrders = useCallback(() => {
    getLiveOrders()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results ?? data?.orders ?? [];
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleMarkServed = async (order) => {
    const oid = order.order_id ?? order.id;
    setUpdatingId(oid);
    const previous = orders.find((o) => (o.order_id ?? o.id) === oid);
    setOrders((prev) => prev.filter((o) => (o.order_id ?? o.id) !== oid));
    setClosedOrders((prev) => [...prev, { ...order, status: STATUS_FINISHED }]);
    try {
      await updateOrderStatus(oid, STATUS_FINISHED);
    } catch (err) {
      setOrders((prev) => (previous ? [previous, ...prev] : prev));
      setClosedOrders((prev) => prev.filter((o) => (o.order_id ?? o.id) !== oid));
      setToast(err?.message ?? 'Failed to close order', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== STATUS_FINISHED);
  const finishedOrders = closedOrders;
  const displayList = tab === 'active' ? activeOrders : finishedOrders;

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Live Orders</h1>
        <p className="mt-1 text-sm text-edueats-textMuted">Total Orders ({activeOrders.length + finishedOrders.length})</p>
      </header>

      <div className="px-6 py-4">
        <div className="flex gap-2 border-b border-edueats-border pb-2">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'active' ? 'bg-edueats-accent text-white' : 'bg-edueats-surface text-edueats-textMuted'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setTab('finished')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'finished' ? 'bg-edueats-accent text-white' : 'bg-edueats-surface text-edueats-textMuted'
            }`}
          >
            Finished
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : displayList.length === 0 ? (
          <Card className="mt-4">
            <p className="text-center text-sm text-edueats-textMuted">
              {tab === 'active' ? 'No active orders' : 'No finished orders'}
            </p>
          </Card>
        ) : (
          <div className="mt-4 space-y-4">
            {displayList.map((o) => (
              <Card key={o.order_id ?? o.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-edueats-text">{o.meal_name ?? o.items?.[0]?.name ?? `Order #${o.order_id ?? o.id}`}</p>
                    <p className="text-xs text-edueats-textMuted">Student ID: {o.student}</p>
                    <p className="text-sm text-edueats-textMuted">
                      Qty: {o.quantity ?? 1} &nbsp;·&nbsp; Ksh {o.total_amount ?? o.total ?? '-'}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      o.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                      o.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-edueats-border text-edueats-textMuted'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  {tab === 'active' && (
                    <Button
                      variant="secondary"
                      disabled={updatingId === (o.order_id ?? o.id)}
                      onClick={() => handleMarkServed(o)}
                    >
                      {updatingId === (o.order_id ?? o.id) ? '...' : 'Mark Served'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
