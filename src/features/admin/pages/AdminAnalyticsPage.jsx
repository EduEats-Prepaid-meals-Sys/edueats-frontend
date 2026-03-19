import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessReport } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
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
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-sm text-edueats-textMuted">Revenue</p>
              <p className="text-xl font-bold text-edueats-text">Ksh {revenue}</p>
            </Card>
            <Card>
              <p className="text-sm text-edueats-textMuted">Total Orders</p>
              <p className="text-xl font-bold text-edueats-text">{totalOrders}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
