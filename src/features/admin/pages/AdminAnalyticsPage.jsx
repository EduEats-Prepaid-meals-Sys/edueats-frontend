import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';
import { StatCardSkeleton } from '../../../components/Skeleton.jsx';

const toNumber = (value) => Number(value ?? 0);
const formatNumber = (value) => toNumber(value).toLocaleString('en-KE');

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  const revenue = report?.today_revenue ?? report?.revenue_today ?? report?.total_revenue ?? 0;
  const totalOrders = report?.total_transactions ?? report?.total_orders ?? report?.orders_count ?? 0;
  const totalStudents = report?.total_students ?? report?.students_count ?? report?.active_users ?? 0;
  const weeklyRevenue = report?.weekly_revenue ?? report?.week_revenue ?? 0;

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
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Analytics</h1>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            <StatCardSkeleton className="border border-edueats-accent bg-edueats-accent" />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-edueats-accent bg-edueats-accent">
              <p className="text-sm text-white/90">Today Revenue</p>
              <p className="text-xl font-bold text-white">Ksh {formatNumber(revenue)}</p>
            </Card>
            <Card>
              <p className="text-sm text-edueats-textMuted">Transactions</p>
              <p className="text-xl font-bold text-edueats-text">{formatNumber(totalOrders)}</p>
            </Card>
            <Card>
              <p className="text-sm text-edueats-textMuted">Total Students</p>
              <p className="text-xl font-bold text-edueats-text">{formatNumber(totalStudents)}</p>
            </Card>
            <Card>
              <p className="text-sm text-edueats-textMuted">Weekly Revenue</p>
              <p className="text-xl font-bold text-edueats-text">Ksh {formatNumber(weeklyRevenue)}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
