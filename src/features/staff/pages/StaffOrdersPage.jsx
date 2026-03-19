import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLiveOrders, updateOrderStatus } from '../../../api/modules/ordersApi.js';
import { useToast } from '../../../App.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import { canDownloadReceipt, downloadReceipt, getOrderAmount, getOrderItems, getStudentName } from '../../../utils/receiptUtils.js';
import { FiDownload } from 'react-icons/fi';

const POLL_INTERVAL_MS = 12000;
const STATUS_PAID = 'paid';
const STATUS_SERVED = 'served';

const getOrderId = (order) => order.order_id ?? order.id;

const getStatus = (order) => String(order?.status ?? '').toLowerCase();

const isServed = (order) => {
  const status = getStatus(order);
  return status === STATUS_SERVED || status === 'completed';
};

const toDisplayStatus = (order) => {
  const status = getStatus(order);
  if (status === 'completed') return STATUS_SERVED;
  return status || 'pending';
};

const statusBadgeClass = (status) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'preparing') return 'bg-blue-100 text-blue-700';
  if (status === STATUS_PAID) return 'bg-indigo-100 text-indigo-700';
  if (status === STATUS_SERVED) return 'bg-green-100 text-green-700';
  return 'bg-edueats-border text-edueats-textMuted';
};

export default function StaffOrdersPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [orders, setOrders] = useState([]);
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

  const applyStatusLocally = (oid, nextStatus) => {
    setOrders((prev) =>
      prev.map((item) =>
        getOrderId(item) === oid
          ? { ...item, status: nextStatus }
          : item
      )
    );
  };

  const handleMarkPaid = async (order) => {
    const oid = getOrderId(order);
    setUpdatingId(oid);
    const previous = orders.find((o) => getOrderId(o) === oid);
    applyStatusLocally(oid, STATUS_PAID);
    try {
      await updateOrderStatus(oid, STATUS_PAID);
    } catch (err) {
      applyStatusLocally(oid, previous?.status ?? 'pending');
      setToast(err?.message ?? 'Failed to mark order as paid', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkServed = async (order) => {
    const oid = getOrderId(order);
    setUpdatingId(oid);
    const previous = orders.find((o) => getOrderId(o) === oid);
    applyStatusLocally(oid, STATUS_SERVED);
    try {
      // Some backends use "completed" for served state.
      await updateOrderStatus(oid, STATUS_SERVED).catch(() => updateOrderStatus(oid, 'completed'));
    } catch (err) {
      applyStatusLocally(oid, previous?.status ?? STATUS_PAID);
      setToast(err?.message ?? 'Failed to mark order as served', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = orders.filter((o) => !isServed(o));
  const servedOrders = orders.filter((o) => isServed(o));
  const displayList = tab === 'active' ? activeOrders : servedOrders;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/staff/orders', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <button type="button" onClick={handleBack} className="text-edueats-text">
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Live Orders</h1>
        <p className="mt-1 text-sm text-edueats-textMuted">Total Orders ({orders.length})</p>
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
            onClick={() => setTab('served')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'served' ? 'bg-edueats-accent text-white' : 'bg-edueats-surface text-edueats-textMuted'
            }`}
          >
            Served
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : displayList.length === 0 ? (
          <Card className="mt-4">
            <p className="text-center text-sm text-edueats-textMuted">
              {tab === 'active' ? 'No active orders' : 'No served orders'}
            </p>
          </Card>
        ) : (
          <div className="mt-4 space-y-4">
            {displayList.map((o) => {
              const orderId = getOrderId(o);
              const status = toDisplayStatus(o);
              const studentName = getStudentName(o, `Student ${o.student ?? ''}`.trim());
              const items = getOrderItems(o);
              const total = getOrderAmount(o);

              return (
              <Card key={orderId} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-edueats-text">Order #{orderId}</p>
                    <p className="text-xs text-edueats-textMuted">Student: {studentName}</p>
                    <p className="text-xs text-edueats-textMuted">Student ID: {o.student ?? o.student_id ?? '-'}</p>
                    {items.map((item) => (
                      <p key={item.id} className="text-sm text-edueats-textMuted">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                    <p className="text-sm text-edueats-textMuted">
                      Total: Ksh {total}
                    </p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(status)}
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {tab === 'active' && status !== STATUS_PAID && (
                      <Button
                        variant="secondary"
                        disabled={updatingId === orderId}
                        onClick={() => handleMarkPaid(o)}
                      >
                        {updatingId === orderId ? '...' : 'Mark Paid'}
                      </Button>
                    )}
                    {tab === 'active' && status === STATUS_PAID && (
                      <Button
                        variant="secondary"
                        disabled={updatingId === orderId}
                        onClick={() => handleMarkServed(o)}
                      >
                        {updatingId === orderId ? '...' : 'Mark Served'}
                      </Button>
                    )}
                    {canDownloadReceipt({ ...o, status }) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await downloadReceipt({ ...o, status }, { actor: 'staff' });
                          } catch (err) {
                            setToast(err?.message ?? 'Failed to download receipt', 'error');
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded bg-edueats-surface px-2 py-1 text-xs font-medium text-edueats-accent hover:bg-edueats-border"
                      >
                        <FiDownload className="h-3.5 w-3.5" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
