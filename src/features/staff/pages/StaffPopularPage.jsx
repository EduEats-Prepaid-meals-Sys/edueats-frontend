import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMessReport } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';

export default function StaffPopularPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMessReport()
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  const revenue = report?.revenue_today ?? report?.revenue ?? 0;
  const totalOrders = report?.total_orders ?? report?.orders_count ?? 0;
  const ranking = report?.ranking ?? report?.top_items ?? [];
  const chartData = report?.by_item ?? report?.items ?? ranking;

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
