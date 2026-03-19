import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPersonalReport, getStudentTrend } from '../../../api/modules/reportsApi.js';
import { getMyLimits } from '../../../api/modules/limitsApi.js';
import Card from '../../../components/Card.jsx';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const shortLabel = (value, index) => {
  if (!value) return `D${index + 1}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `D${index + 1}`;
  return date.toLocaleDateString('en-KE', { weekday: 'short' });
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

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPersonalReport().catch(() => null),
      getStudentTrend(7).catch(() => []),
      getMyLimits().catch(() => null),
    ])
      .then(([summary, trendData, limitData]) => {
        setReport(summary);
        setTrend(Array.isArray(trendData) ? trendData : trendData?.results ?? []);
        setLimits(limitData);
      })
      .finally(() => setLoading(false));
  }, []);

  const dailySpend =
    report?.daily_spent ??
    report?.today_spent ??
    report?.spent_today ??
    report?.day_total ??
    0;

  const weeklySpend =
    report?.weekly_spent ??
    report?.week_spent ??
    report?.spent_week ??
    report?.week_total ??
    0;

  const dailyLimit =
    limits?.daily_limit ??
    limits?.dailyLimit ??
    report?.daily_limit ??
    report?.limit_daily ??
    0;

  const normalizedTrend = trend.map((entry, index) => ({
    label: shortLabel(entry?.date, index),
    value: toNumber(entry?.total ?? entry?.amount ?? entry?.spent ?? 0),
    date: entry?.date,
  }));

  const maxTrend = Math.max(...normalizedTrend.map((entry) => entry.value), 1);
  const dailyUtilization = dailyLimit > 0 ? Math.min(100, (toNumber(dailySpend) / toNumber(dailyLimit)) * 100) : 0;
  const trendValues = normalizedTrend.map((entry) => entry.value);
  const trendLinePath = buildLinePath(trendValues);

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
            <Card>
              <p className="text-sm text-edueats-textMuted">Daily spending</p>
              <p className="text-xl font-semibold text-edueats-text">Ksh {dailySpend}</p>
              <p className="mt-1 text-xs text-edueats-textMuted">Daily limit: Ksh {dailyLimit}</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-edueats-border">
                <div
                  className={`h-full rounded-full ${dailyUtilization >= 100 ? 'bg-edueats-danger' : 'bg-edueats-accent'}`}
                  style={{ width: `${dailyUtilization}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-edueats-textMuted">{dailyUtilization.toFixed(0)}% of daily limit used</p>
            </Card>
            <Card>
              <p className="text-sm text-edueats-textMuted">Weekly spending</p>
              <p className="text-xl font-semibold text-edueats-text">Ksh {weeklySpend}</p>
            </Card>
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
              <p className="mb-2 text-sm text-edueats-textMuted">7-day spend bar graph</p>
              {normalizedTrend.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No trend data available.</p>
              ) : (
                <>
                  <div className="mt-1 flex h-40 items-end gap-2">
                    {normalizedTrend.map((entry, idx) => {
                      const heightPct = Math.max(6, (entry.value / maxTrend) * 100);
                      return (
                        <div key={entry.date ?? idx} className="flex flex-1 flex-col items-center gap-2">
                          <div className="text-[10px] text-edueats-textMuted">{entry.value}</div>
                          <div className="flex h-28 w-full items-end rounded-md bg-edueats-surface px-1 py-1">
                            <div
                              className="w-full rounded-sm bg-edueats-accent"
                              style={{ height: `${heightPct}%` }}
                              title={`${entry.label}: Ksh ${entry.value}`}
                            />
                          </div>
                          <div className="text-[10px] text-edueats-textMuted">{entry.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            <Card>
              <p className="mb-2 text-sm text-edueats-textMuted">7-day trend line</p>
              {normalizedTrend.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No trend data available.</p>
              ) : (
                <div className="rounded-md bg-edueats-surface p-3">
                  <svg viewBox="0 0 320 120" className="h-32 w-full" role="img" aria-label="Daily spending trend line">
                    <path d={trendLinePath} fill="none" stroke="currentColor" strokeWidth="3" className="text-edueats-accent" />
                    {trendValues.map((value, idx) => {
                      const max = Math.max(...trendValues, 1);
                      const step = trendValues.length > 1 ? (320 - 24) / (trendValues.length - 1) : 0;
                      const x = 12 + step * idx;
                      const y = 120 - 12 - (value / max) * (120 - 24);
                      return <circle key={`${idx}-${value}`} cx={x} cy={y} r="3" className="fill-edueats-accent" />;
                    })}
                  </svg>
                  <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-edueats-textMuted">
                    {normalizedTrend.map((entry, idx) => (
                      <span key={`${entry.date ?? entry.label}-${idx}`} className="text-center">{entry.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
