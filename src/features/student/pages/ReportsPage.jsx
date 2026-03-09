import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPersonalReport } from '../../../api/modules/reportsApi.js';
import Card from '../../../components/Card.jsx';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalReport()
      .then(setReport)
      .catch(() => setReport(null))
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
          </div>
        )}
      </div>
    </div>
  );
}
