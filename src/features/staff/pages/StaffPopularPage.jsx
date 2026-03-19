import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMessReport } from '../../../api/modules/reportsApi.js';
import { getLiveOrders } from '../../../api/modules/ordersApi.js';
import Card from '../../../components/Card.jsx';

const toAmount = (order) => Number(order?.total_amount ?? order?.total ?? order?.amount ?? 0);

const isSameDay = (value) => {
  if (!value) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isRevenueStatus = (status) => ['paid', 'served', 'completed'].includes(String(status || '').toLowerCase());

export default function StaffPopularPage() {
  const [report, setReport] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMessReport().catch(() => null),
      getLiveOrders().catch(() => []),
    ])
      .then(([mess, orders]) => {
        setReport(mess);
        setLiveOrders(Array.isArray(orders) ? orders : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const apiRevenue = Number(report?.revenue_today ?? report?.revenue ?? 0);
  const derivedRevenue = liveOrders
    .filter((order) => isRevenueStatus(order?.status) && isSameDay(order?.created_at ?? order?.ordered_at))
    .reduce((sum, order) => sum + toAmount(order), 0);

  const revenue = derivedRevenue > 0 ? derivedRevenue : apiRevenue;
  const totalOrders = liveOrders.length > 0
    ? liveOrders.filter((order) => isSameDay(order?.created_at ?? order?.ordered_at)).length
    : report?.total_orders ?? report?.orders_count ?? 0;
  const ranking = report?.ranking ?? report?.top_items ?? [];
  const usingDerivedRevenue = derivedRevenue > 0 && derivedRevenue !== apiRevenue;

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Popular Meals</h1>
      </header>

      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-edueats-textMuted">Revenue Today</p>
            <p className="text-xl font-bold text-edueats-text">Ksh {revenue}</p>
            {usingDerivedRevenue && (
              <p className="mt-1 text-xs text-edueats-textMuted">Calculated from paid/served orders</p>
            )}
          </Card>
          <Card>
            <p className="text-sm text-edueats-textMuted">Total Orders</p>
            <p className="text-xl font-bold text-edueats-text">{totalOrders}</p>
          </Card>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : (
          <>
            <h2 className="mt-6 text-lg font-semibold text-edueats-text">Ranking</h2>
            <Card className="mt-2">
              {ranking.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No data yet</p>
              ) : (
                <ul className="space-y-3">
                  {ranking.slice(0, 10).map((item, i) => (
                    <li key={item.id ?? item.name ?? i} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-edueats-accent/20 text-sm font-medium text-edueats-text">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-medium text-edueats-text">{item.name ?? item.meal_name ?? `Item ${i + 1}`}</span>
                      <span className="text-sm text-edueats-textMuted">{item.count ?? item.orders ?? 0} orders</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
