import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffPopularMeals, getStaffSalesSummary } from '../../../api/modules/reportsApi.js';
import { getStaffPaymentSummary } from '../../../api/modules/paymentsApi.js';
import Card from '../../../components/Card.jsx';
import { StatCardSkeleton, Skeleton } from '../../../components/Skeleton.jsx';

const yyyyMmDd = (date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatNumber = (value) => Number(value ?? 0).toLocaleString('en-KE');

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState({ sales: null, payments: null, ranking: [] });
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const fromDefault = new Date(today);
  fromDefault.setDate(today.getDate() - 29);
  const [startDate, setStartDate] = useState(yyyyMmDd(fromDefault));
  const [endDate, setEndDate] = useState(yyyyMmDd(today));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStaffSalesSummary({ startDate, endDate }).catch(() => null),
      getStaffPaymentSummary({ startDate, endDate }).catch(() => null),
      getStaffPopularMeals({ startDate, endDate, limit: 10 }).catch(() => []),
    ])
      .then(([sales, payments, ranking]) => {
        setReport({ sales, payments, ranking });
      })
      .catch(() => setReport({ sales: null, payments: null, ranking: [] }))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const totalRevenue = report?.sales?.total_revenue ?? report?.payments?.total_revenue ?? 0;
  const totalTransactions = report?.sales?.total_transactions ?? report?.sales?.total_orders ?? report?.payments?.total_transactions ?? 0;
  const ranking = report?.ranking ?? [];

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
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
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Reports</h1>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <div className="space-y-4">
            <div className="rounded-card bg-edueats-surface p-4 shadow-card">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-9 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
            <div className="rounded-card bg-edueats-surface p-4 shadow-card space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <div className="grid grid-cols-2 gap-3">
                <StatCardSkeleton className="border border-edueats-accent bg-edueats-accent" />
                <StatCardSkeleton />
              </div>
            </div>
            <div className="rounded-card bg-edueats-surface p-4 shadow-card space-y-2">
              <Skeleton className="h-4 w-1/4 mb-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-edueats-textMuted">
                  <span className="mb-1 block">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="w-full rounded-lg border border-edueats-border bg-white px-2 py-2 text-sm text-edueats-text"
                  />
                </label>
                <label className="text-xs text-edueats-textMuted">
                  <span className="mb-1 block">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="w-full rounded-lg border border-edueats-border bg-white px-2 py-2 text-sm text-edueats-text"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-medium text-edueats-text">Range Summary</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-edueats-accent bg-edueats-accent px-3 py-2">
                  <p className="text-white/90">Total Revenue</p>
                  <p className="font-semibold text-white">Ksh {formatNumber(totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-edueats-textMuted">Transactions</p>
                  <p className="font-semibold text-edueats-text">{formatNumber(totalTransactions)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-lg font-medium text-edueats-text">Top Meals</h2>
              {ranking.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No data</p>
              ) : (
                <ul className="space-y-2">
                  {ranking.map((item, i) => (
                    <li key={item.id ?? i} className="flex justify-between text-sm">
                      <span className="text-edueats-text">{item.name ?? item.meal_name ?? `Item ${i + 1}`}</span>
                      <span className="text-edueats-textMuted">{item.order_count ?? item.total_quantity ?? item.count ?? item.orders ?? 0}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
