import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useCart, useToast } from '../../../App.jsx';
import { getMenu } from '../../../api/modules/menuApi.js';
import { getStudentPaymentHistory } from '../../../api/modules/paymentsApi.js';
import { getOrderHistory } from '../../../api/modules/ordersApi.js';
import { downloadReceipt, canDownloadReceipt } from '../../../utils/receiptUtils.js';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiCreditCard, FiShoppingCart, FiTrendingUp, FiArrowUp, FiDownload } from 'react-icons/fi';

const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

const getOrderIdentifier = (order) =>
  order?.order_id ?? order?.id ?? null;

const getPaymentOrderIdentifier = (payment) =>
  payment?.order_id ?? payment?.order?.order_id ?? payment?.order?.id ?? null;

const getOrderedSummary = (payment, orderMap) => {
  const orderId = getPaymentOrderIdentifier(payment);
  const linkedOrder = orderId ? orderMap.get(orderId) : null;

  if (linkedOrder?.items && Array.isArray(linkedOrder.items) && linkedOrder.items.length > 0) {
    return linkedOrder.items
      .slice(0, 2)
      .map((item) => `${item.quantity ?? item.qty ?? 1}x ${item.meal_name ?? item.name ?? 'Meal'}`)
      .join(' • ');
  }

  if (linkedOrder?.meal_name) {
    return `${linkedOrder.quantity ?? 1}x ${linkedOrder.meal_name}`;
  }

  if (payment?.items && Array.isArray(payment.items) && payment.items.length > 0) {
    return payment.items
      .slice(0, 2)
      .map((item) => `${item.quantity ?? item.qty ?? 1}x ${item.meal_name ?? item.name ?? 'Meal'}`)
      .join(' • ');
  }

  if (payment?.meal_name) {
    return `${payment.quantity ?? 1}x ${payment.meal_name}`;
  }

  return orderId ? `Order #${orderId}` : 'Recent order';
};

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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function StudentHomePage() {
  const { user, refreshUser } = useAuth();
  const { setToast } = useToast();
  const { count } = useCart();
  const [menu, setMenu] = useState([]);
  const [history, setHistory] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const name = user?.name ?? user?.full_name ?? user?.username ?? 'Student';
  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMenu().catch(() => []),
      getStudentPaymentHistory().catch(() => []),
      getOrderHistory().catch(() => []),
    ])
      .then(([menuList, paymentHistory, orderHistory]) => {
        if (!cancelled) {
          setMenu(Array.isArray(menuList) ? menuList : menuList?.results ?? []);
          const list = Array.isArray(paymentHistory) ? paymentHistory : paymentHistory?.results ?? [];
          setHistory(list.filter(isOrderPayment));
          setRecentOrders(Array.isArray(orderHistory) ? orderHistory : orderHistory?.results ?? []);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const orderMap = new Map(recentOrders.map((order) => [getOrderIdentifier(order), order]));

  const bestSellers = menu.slice(0, 6);
  const filtered = search.trim()
    ? bestSellers.filter(
        (m) =>
          (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (m.meal_type || '').toLowerCase().includes(search.toLowerCase())
      )
    : bestSellers;

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <h1 className="text-xl font-semibold text-edueats-text">
          {greeting()}, {name}
        </h1>
        <div className="mt-4">
          <Card className="bg-gradient-to-br from-edueats-primary to-edueats-primaryDeep border-0 shadow-lg relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <FiCreditCard className="text-lg text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">Available Balance</p>
                    <p className="text-3xl font-bold text-white">Ksh {balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <FiTrendingUp className="text-xl text-white" />
                </div>
              </div>
              
              {/* Action buttons */}
               {/* Action buttons */}
<div className="flex gap-2">
  <Link to="/student/menu" className="flex-1">
    <Button className="w-full bg-white !text-black hover:bg-white/90 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
      Order
    </Button>
  </Link>

  <Link to="/student/wallet" className="flex-1">
    <Button className="w-full bg-white/20 backdrop-blur-sm !text-black border-white/30 hover:bg-white/30 transition-all duration-200 font-semibold">
      <FiArrowUp className="mr-2" />
      Top Up
    </Button>
  </Link>
</div>
            </div>
          </Card>
        </div>
        <div className="mt-4">
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-edueats-border bg-white px-4 py-2.5 text-sm text-edueats-text placeholder:text-edueats-textMuted focus:outline-none focus:ring-2 focus:ring-edueats-accent"
          />
        </div>
      </header>

      <div className="px-6 py-4">
        {/* <h2 className="text-sm font-medium text-edueats-textMuted">Categories</h2>
        <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to={`/student/menu?type=${c.id}`}
              className="flex shrink-0 flex-col items-center gap-1 rounded-card bg-edueats-surface p-4 shadow-card"
            >
              <span className="text-xs font-medium text-edueats-text">{c.label}</span>
            </Link>
          ))}
        </div> */}

        <h2 className="mt-6 text-lg font-semibold text-edueats-text">Best Seller</h2>
        {loading ? (
          <p className="py-4 text-sm text-edueats-textMuted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-sm text-edueats-textMuted">No items</p>
        ) : (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-6 px-4">
            {filtered.map((m) => (
              <Link
                key={m.id}
                to={`/student/menu/${m.id}`}
                className="flex w-36 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                {/* Meal Image - Full Height */}
                <div className="relative h-full min-h-48 bg-gradient-to-br from-edueats-border to-edueats-surface overflow-hidden">
                  {/* Out of Stock Badge */}
                  {!(m.available !== false && m.in_stock !== false) && (
                    <div className="absolute top-2 left-2 right-2 z-10">
                      <div className="bg-edueats-danger text-white text-xs font-bold px-3 py-1 rounded-full text-center">
                        Out of Stock
                      </div>
                    </div>
                  )}
                  
                  <img
                    src={m.image_url || m.imageUrl || foodPlaceholder}
                    alt={m.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = foodPlaceholder;
                    }}
                  />
                  
                  {/* Overlay for text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-sm font-bold truncate leading-tight mb-1">
                      {m.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">Ksh {m.price}</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          m.available !== false && m.in_stock !== false
                            ? 'bg-edueats-success'
                            : 'bg-edueats-danger'
                        }`}></div>
                        <span className="text-xs">
                          {m.available !== false && m.in_stock !== false ? 'Available' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-edueats-text">Recent Payments</h2>
          <Link to="/student/orders" className="text-sm text-edueats-accent">View All</Link>
        </div>
        {loading ? (
          <p className="py-4 text-sm text-edueats-textMuted">Loading...</p>
        ) : history.length === 0 ? (
          <Card className="mt-2">
            <p className="text-sm text-edueats-textMuted">No recent order payments</p>
          </Card>
        ) : (
          <div className="mt-2 space-y-2">
            {history.slice(0, 5).map((o, index) => (
              <Card key={o.payment_id ?? o.id ?? index} className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-edueats-text">Order Payment #{o.payment_id ?? o.id ?? index + 1}</p>
                  <p className="text-xs text-edueats-textMuted">
                    {getOrderedSummary(o, orderMap)}
                  </p>
                  <p className="text-xs text-edueats-textMuted">
                    Ksh {o.total_amount ?? o.total ?? o.amount ?? '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-edueats-textMuted">{o.status ?? 'paid'}</span>
                  {canDownloadReceipt(o) && (
                    <button
                      onClick={async () => {
                        try {
                          await downloadReceipt(o, { actor: 'student' });
                        } catch (err) {
                          setToast(err?.message ?? 'Failed to download receipt', 'error');
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-edueats-accent hover:bg-edueats-surface rounded transition-colors"
                      title="Download official receipt"
                    >
                      <FiDownload className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {count > 0 && (
        <Link
          to="/student/cart"
          className="fixed right-4 top-24 flex h-10 w-10 items-center justify-center rounded-full bg-edueats-accent text-sm font-semibold text-white shadow-card"
        >
          {count}
        </Link>
      )}
    </div>
  );
}
