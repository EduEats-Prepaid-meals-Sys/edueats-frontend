import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { getDashboardSummary, getStaffPopularMeals } from '../../../api/modules/reportsApi.js';
import { getStaffPayments } from '../../../api/modules/paymentsApi.js';
import Card from '../../../components/Card.jsx';
import { StatCardSkeleton, ChartSkeleton, Skeleton } from '../../../components/Skeleton.jsx';

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDays = (entry, days) => {
  const date = parseDate(entry?.created_at ?? entry?.ordered_at ?? entry?.payment_date ?? entry?.updated_at);
  if (!date) return false;
  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - (days - 1));
  threshold.setHours(0, 0, 0, 0);
  return date >= threshold;
};

const currency = (value) => Number(value ?? 0).toLocaleString('en-KE');

const toAmount = (entry) => Number(entry?.amount ?? entry?.total_amount ?? entry?.total ?? 0);

const weekdayRevenue = (payments) => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = labels.map((label, index) => ({
    label,
    weekday: index === 6 ? 0 : index + 1,
    value: 0,
  }));

  payments.forEach((entry) => {
    const date = parseDate(entry?.created_at ?? entry?.ordered_at ?? entry?.payment_date ?? entry?.updated_at);
    if (!date) return;
    const slot = base.find((item) => item.weekday === date.getDay());
    if (!slot) return;
    slot.value += toAmount(entry);
  });

  return base;
};

const buildLinePath = (series, width = 320, height = 120, pad = 12) => {
  if (!Array.isArray(series) || series.length === 0) return '';
  const max = Math.max(...series, 1);
  const step = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0;

  return series
    .map((value, idx) => {
      const x = pad + step * idx;
      const y = height - pad - (value / max) * (height - pad * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

export default function StaffDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardSummary().catch(() => null),
      getStaffPopularMeals({ limit: 5 }).catch(() => []),
      getStaffPayments({ paymentType: 'order_payment' }).catch(() => []),
    ])
      .then(([dashboard, popularMeals, staffPayments]) => {
        setSummary(dashboard);
        setRanking(Array.isArray(popularMeals) ? popularMeals : []);
        setPayments(Array.isArray(staffPayments) ? staffPayments : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const todayRevenueFromPayments = payments
      .filter((entry) => isWithinDays(entry, 1))
      .reduce((sum, entry) => sum + toAmount(entry), 0);

    const weeklyRevenueFromPayments = payments
      .filter((entry) => isWithinDays(entry, 7))
      .reduce((sum, entry) => sum + toAmount(entry), 0);

    const monthlyRevenueFromPayments = payments
      .filter((entry) => isWithinDays(entry, 30))
      .reduce((sum, entry) => sum + toAmount(entry), 0);

    const weekTransactions = payments.filter((entry) => isWithinDays(entry, 7)).length;

    return {
      todayRevenue: todayRevenueFromPayments || Number(summary?.today_revenue ?? summary?.revenue_today ?? 0),
      weeklyRevenue: weeklyRevenueFromPayments || Number(summary?.weekly_revenue ?? summary?.week_revenue ?? 0),
      monthlyRevenue: monthlyRevenueFromPayments || Number(summary?.monthly_revenue ?? summary?.month_revenue ?? 0),
      activeUsers: Number(summary?.total_students ?? summary?.students_count ?? summary?.active_users ?? 0),
      avgTransactionsPerDay:
        weekTransactions > 0 ? weekTransactions / 7 : Number(summary?.avg_transactions_per_day ?? 0),
    };
  }, [payments, summary]);

  const weeklySeries = weekdayRevenue(payments.filter((entry) => isWithinDays(entry, 7)));
  const weeklyValues = weeklySeries.map((item) => item.value);
  const weeklyPath = buildLinePath(weeklyValues);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <h1 className="text-3xl font-semibold text-edueats-text">Caterer Dashboard</h1>
      </header>

      <div className="space-y-3 px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            <StatCardSkeleton className="border border-edueats-accent p-4" />
            <div className="grid grid-cols-2 gap-3">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <ChartSkeleton height="h-36" className="bg-[#E8E8E8]" />
            <div className="rounded-card bg-edueats-surface p-3 shadow-card space-y-2">
              <Skeleton className="h-4 w-1/4 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <Card className="border border-edueats-accent bg-edueats-accent p-4 text-white">
              <div className="mb-1 flex items-center gap-2 text-xs text-white/90">
                <FiDollarSign />
                <span>Today</span>
              </div>
              <p className="text-3xl font-semibold">Ksh {currency(metrics.todayRevenue)}</p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="rounded-xl border border-edueats-accent bg-edueats-surface p-3">
                <p className="text-xs text-edueats-textMuted">Weekly Revenue</p>
                <p className="text-2xl font-semibold text-edueats-text">Ksh {currency(metrics.weeklyRevenue)}</p>
              </Card>
              <Card className="rounded-xl border border-edueats-accent bg-edueats-surface p-3">
                <p className="text-xs text-edueats-textMuted">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-edueats-text">Ksh {currency(metrics.monthlyRevenue)}</p>
              </Card>
              <Card className="rounded-xl border border-edueats-accent bg-edueats-surface p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-edueats-textMuted">
                  <FiUsers />
                  <span>Active Users</span>
                </div>
                <p className="text-2xl font-semibold text-edueats-text">{currency(metrics.activeUsers)}</p>
              </Card>
              <Card className="rounded-xl border border-edueats-accent bg-edueats-surface p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-edueats-textMuted">
                  <FiTrendingUp />
                  <span>Average Transactions Per Day</span>
                </div>
                <p className="text-2xl font-semibold text-edueats-text">{metrics.avgTransactionsPerDay.toFixed(1)}</p>
              </Card>
            </div>

            <Card className="rounded-xl border border-edueats-accent bg-[#E8E8E8] p-3">
              <p className="mb-2 text-sm font-medium text-edueats-text">Weekly Revenue</p>
              {weeklyValues.every((value) => value === 0) ? (
                <p className="py-6 text-center text-sm text-edueats-textMuted">No graph available for this week</p>
              ) : (
                <div className="rounded-md border border-edueats-text/40 bg-[#E0E0E0] p-2">
                  <svg viewBox="0 0 320 120" className="h-36 w-full" role="img" aria-label="Weekly revenue trend">
                    <path d={weeklyPath} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-edueats-text" />
                  </svg>
                  <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[10px] text-edueats-textMuted">
                    {weeklySeries.map((item) => (
                      <span key={item.label}>{item.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="rounded-xl bg-edueats-surface p-3">
              <p className="mb-2 text-sm font-medium text-edueats-text">Top Meals</p>
              {ranking.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No ranking data yet</p>
              ) : (
                <ul className="space-y-2">
                  {ranking.map((item, index) => (
                    <li key={item.id ?? item.meal_name ?? index} className="flex items-center gap-3 rounded-lg border border-edueats-accent px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-edueats-accent text-[10px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-edueats-text">{item.name ?? item.meal_name ?? `Meal ${index + 1}`}</span>
                      <span className="text-xs text-edueats-accent">{item.order_count ?? item.total_quantity ?? item.count ?? item.orders ?? 0} Orders</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="grid grid-cols-2 gap-3 pb-2">
              <Link to="/staff/orders" className="rounded-full bg-edueats-accent px-4 py-2 text-center text-sm font-medium text-white">
                Open Orders
              </Link>
              <Link to="/staff/menu" className="rounded-full border border-edueats-accent px-4 py-2 text-center text-sm font-medium text-edueats-accent">
                Manage Menu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
