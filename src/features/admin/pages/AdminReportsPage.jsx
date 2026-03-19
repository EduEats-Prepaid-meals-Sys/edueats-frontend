import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMessReport } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMessReport()
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  const ranking = report?.ranking ?? report?.top_items ?? [];

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
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : (
          <Card>
            <h2 className="mb-4 text-lg font-medium text-edueats-text">Mess report</h2>
            {ranking.length === 0 ? (
              <p className="text-sm text-edueats-textMuted">No data</p>
            ) : (
              <ul className="space-y-2">
                {ranking.map((item, i) => (
                  <li key={item.id ?? i} className="flex justify-between text-sm">
                    <span className="text-edueats-text">{item.name ?? item.meal_name ?? `Item ${i + 1}`}</span>
                    <span className="text-edueats-textMuted">{item.count ?? item.orders ?? 0} orders</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
