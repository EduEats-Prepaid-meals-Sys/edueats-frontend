import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { canManageMenu } from '../../../auth/accessControl.js';
import { getMenu } from '../../../api/modules/menuApi.js';
import Card from '../../../components/Card.jsx';
import { MenuItemSkeleton } from '../../../components/Skeleton.jsx';

export default function AdminMenuPage() {
  const { roles } = useAuth();
  const navigate = useNavigate();
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
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/admin/analytics', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <Card className="mt-4">
          <p className="text-center text-sm text-edueats-textMuted">You do not have permission to manage the menu.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/admin/analytics" className="text-edueats-text">Back</Link>
          <h1 className="text-xl font-semibold text-edueats-text">Menu Management</h1>
          <span className="rounded-full bg-edueats-accent px-4 py-2 text-sm font-medium text-white">Add Meal</span>
        </div>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
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
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-edueats-text">{m.name}</p>
                    <p className="text-sm text-edueats-textMuted">Ksh {m.price}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      available ? 'bg-edueats-success/20 text-edueats-success' : 'bg-edueats-danger/20 text-edueats-danger'
                    }`}
                  >
                    {available ? 'Available' : 'Not Available'}
                  </span>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
