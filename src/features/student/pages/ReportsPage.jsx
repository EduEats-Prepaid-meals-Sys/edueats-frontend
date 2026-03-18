import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPersonalReport, getStudentTrend } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPersonalReport().catch(() => null),
      getStudentTrend(7).catch(() => []),
    ])
      .then(([summary, trendData]) => {
        setReport(summary);
        setTrend(Array.isArray(trendData) ? trendData : trendData?.results ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/student/home" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Reports</h1>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : !report ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No report data</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {report.total_spent != null && (
              <Card>
                <p className="text-sm text-edueats-textMuted">Total spent</p>
                <p className="text-xl font-semibold text-edueats-text">Ksh {report.total_spent}</p>
              </Card>
            )}
            {report.orders_count != null && (
              <Card>
                <p className="text-sm text-edueats-textMuted">Orders count</p>
                <p className="text-xl font-semibold text-edueats-text">{report.orders_count}</p>
              </Card>
            )}
            <Card>
              <p className="mb-2 text-sm text-edueats-textMuted">7-day spend trend</p>
              {trend.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No trend data available.</p>
              ) : (
                <ul className="space-y-2">
                  {trend.map((entry, idx) => (
                    <li key={entry.date ?? idx} className="flex items-center justify-between text-sm">
                      <span className="text-edueats-text">{entry.date ?? `Day ${idx + 1}`}</span>
                      <span className="font-medium text-edueats-text">Ksh {entry.total ?? entry.amount ?? 0}</span>
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
