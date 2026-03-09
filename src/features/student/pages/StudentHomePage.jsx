import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useCart } from '../../../App.jsx';
import { getMenu } from '../../../api/modules/menuApi.js';
import { getOrderHistory } from '../../../api/modules/ordersApi.js';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';

const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function StudentHomePage() {
  const { user, refreshUser } = useAuth();
  const { count } = useCart();
  const [menu, setMenu] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const name = user?.name ?? user?.username ?? user?.email ?? 'Guest';
  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMenu().catch(() => []), getOrderHistory().catch(() => [])])
      .then(([menuList, orderHistory]) => {
        if (!cancelled) {
          setMenu(Array.isArray(menuList) ? menuList : menuList?.results ?? []);
          setHistory(Array.isArray(orderHistory) ? orderHistory : orderHistory?.results ?? []);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
        <Card className="mt-4 bg-edueats-surfaceAlt/90">
          <p className="text-sm text-edueats-textMuted">Wallet Balance</p>
          <p className="text-2xl font-bold text-edueats-text">Ksh {balance}</p>
          <div className="mt-3 flex gap-2">
            <Link to="/student/menu" className="flex-1">
              <Button variant="secondary" className="w-full text-sm">
                Order Now
              </Button>
            </Link>
            <Link to="/student/wallet" className="flex-1">
              <Button variant="secondary" className="w-full text-sm">
                Top Up
              </Button>
            </Link>
          </div>
        </Card>
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
        <h2 className="text-sm font-medium text-edueats-textMuted">Categories</h2>
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
        </div>

        <h2 className="mt-6 text-lg font-semibold text-edueats-text">Best Seller</h2>
        {loading ? (
          <p className="py-4 text-sm text-edueats-textMuted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-sm text-edueats-textMuted">No items</p>
        ) : (
          <div className="mt-2 flex gap-4 overflow-x-auto pb-4">
            {filtered.map((m) => (
              <Link
                key={m.id}
                to="/student/menu"
                className="flex w-36 shrink-0 flex-col overflow-hidden rounded-card bg-edueats-surface shadow-card"
              >
                <div className="h-24 bg-edueats-border">
                  <img
                    src={m.image_url || m.imageUrl || foodPlaceholder}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = foodPlaceholder;
                    }}
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-edueats-text truncate">{m.name}</p>
                  <p className="text-xs text-edueats-textMuted">Ksh {m.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-edueats-text">Recent Transactions</h2>
          <Link to="/student/orders" className="text-sm text-edueats-accent">View All</Link>
        </div>
        {loading ? (
          <p className="py-4 text-sm text-edueats-textMuted">Loading...</p>
        ) : history.length === 0 ? (
          <Card className="mt-2">
            <p className="text-sm text-edueats-textMuted">No recent orders</p>
          </Card>
        ) : (
          <div className="mt-2 space-y-2">
            {history.slice(0, 5).map((o) => (
              <Card key={o.id} className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-edueats-text">Order #{o.id}</p>
                  <p className="text-xs text-edueats-textMuted">
                    Ksh {o.total ?? o.amount ?? '-'}
                  </p>
                </div>
                <span className="text-xs text-edueats-textMuted">{o.status ?? 'Paid'}</span>
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
