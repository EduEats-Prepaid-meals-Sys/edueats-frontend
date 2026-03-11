import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { canManageMenu } from '../../../auth/accessControl.js';
import { getMenu, updateMenuItem } from '../../../api/modules/menuApi.js';
import Card from '../../../components/Card.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiEdit2, FiPlus } from 'react-icons/fi';

export default function StaffMenuPage() {
  const { roles } = useAuth();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then((data) => setMenu(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  }, []);

  const allowed = canManageMenu(roles);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-edueats-bg px-6 py-10">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <Card className="mt-4">
          <p className="text-center text-sm text-edueats-textMuted">You do not have permission to manage the menu.</p>
        </Card>
      </div>
    );
  }

  const toggleAvailability = (item) => {
    const next = !(item.available !== false && item.in_stock !== false);
    updateMenuItem(item.id, { ...item, available: next, in_stock: next })
      .then(() => setMenu((prev) => prev.map((m) => (m.id === item.id ? { ...m, available: next, in_stock: next } : m))))
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/staff/orders" className="text-edueats-text">Back</Link>
          <h1 className="text-xl font-semibold text-edueats-text truncate">Menu Management</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : menu.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No menu items</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {menu.map((m) => {
              const available = m.available !== false && m.in_stock !== false;
              return (
                <Card key={m.id} className="flex flex-row items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-edueats-border">
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
                    <p className="text-sm text-edueats-textMuted">Ksh {m.price}</p>
                    <p className="text-xs text-edueats-textMuted">{m.meal_type ?? m.mealType ?? ''}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      available ? 'bg-edueats-success/20 text-edueats-success' : 'bg-edueats-danger/20 text-edueats-danger'
                    }`}
                  >
                    {available ? 'Available' : 'Not Available'}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(m)}
                      className="rounded p-1 text-edueats-textMuted"
                      aria-label="Edit"
                    >
                      <FiEdit2 aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Floating Add Button */}
      <Link
        to="/staff/menu/add"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-edueats-accent text-white shadow-lg hover:bg-edueats-accent/90 hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Add Meal"
      >
        <FiPlus className="text-xl font-bold" />
      </Link>
    </div>
  );
}
