import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMenu } from '../../../api/modules/menuApi.js';
import { useCart } from '../../../App.jsx';
import Card from '../../../components/Card.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiShoppingCart } from 'react-icons/fi';

const MEAL_TABS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

const POLL_INTERVAL_MS = 15000; // Refresh menu every 15 seconds

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'lunch';
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, count } = useCart();

  const fetchMenu = useCallback(() => {
    getMenu()
      .then((data) => setMenu(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMenu();
    // Poll for menu updates every 15 seconds so students see live changes
    const pollId = setInterval(fetchMenu, POLL_INTERVAL_MS);
    return () => clearInterval(pollId);
  }, [fetchMenu]);

  const activeTab = MEAL_TABS.find((t) => t.id === typeParam)?.id ?? 'lunch';
  const filtered = menu.filter((m) => {
    const mt = (m.meal_type ?? m.mealType ?? '').toLowerCase();
    return mt === activeTab || (!mt && activeTab === 'lunch');
  });

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-edueats-text">Today&apos;s Menu</h1>
          <Link
            to="/student/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-edueats-surface text-edueats-text"
          >
            <FiShoppingCart className="text-lg" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-edueats-danger text-xs font-semibold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
        <p className="mt-1 text-sm text-edueats-textMuted">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {MEAL_TABS.map((t) => (
            <Link
              key={t.id}
              to={`/student/menu?type=${t.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === t.id
                  ? 'bg-edueats-accent text-white'
                  : 'bg-edueats-surface text-edueats-textMuted'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">No items for this meal</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((m) => {
              const available = m.available !== false && m.in_stock !== false;
              return (
                <Link key={m.id} to={`/student/menu/${m.id}`} className="block">
                  <Card className="flex flex-row items-center gap-4 transition-shadow hover:shadow-md">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-edueats-border">
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
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-edueats-text">{m.name}</p>
                      <p className="text-xs text-edueats-textMuted">
                        {m.meal_type ?? m.mealType ?? 'Lunch'}
                      </p>
                      <p className="text-sm font-medium text-edueats-text">Ksh {m.price}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          available
                            ? 'bg-edueats-success/20 text-edueats-success'
                            : 'bg-edueats-danger/20 text-edueats-danger'
                        }`}
                      >
                        {available ? 'Available' : 'Out of stock'}
                      </span>
                      <button
                        type="button"
                        disabled={!available}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(m, 1);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-edueats-accent text-white disabled:bg-edueats-border disabled:text-edueats-textMuted"
                      >
                        +
                      </button>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
