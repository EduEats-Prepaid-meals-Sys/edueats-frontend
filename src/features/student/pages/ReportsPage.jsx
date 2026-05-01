import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonalReport, getStudentTrend } from '../../../api/modules/reportsApi.js';
import { getMyLimits } from '../../../api/modules/limitsApi.js';
import Card from '../../../components/Card.jsx';
import { Skeleton, StatCardSkeleton, ChartSkeleton } from '../../../components/Skeleton.jsx';
import { FiBarChart2, FiCalendar, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

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

const formatCurrency = (value) => {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return '0';
  return parsed.toLocaleString('en-KE');
};

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const weeklyLabel = (weekStartDate) => {
  const d = new Date(weekStartDate);
  const month = d.toLocaleDateString('en-KE', { month: 'short' });
  return `${month} ${d.getDate()}`;
};

const aggregateByWeek = (entries) => {
  const map = new Map();
  entries.forEach((entry) => {
    if (!entry?.date) return;
    const parsedDate = new Date(entry.date);
    if (Number.isNaN(parsedDate.getTime())) return;
    const weekStart = startOfWeek(parsedDate);
    const key = weekStart.toISOString();
    const current = map.get(key) ?? { label: weeklyLabel(weekStart), value: 0, date: key };
    current.value += toNumber(entry.value);
    map.set(key, current);
  });
  return Array.from(map.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const aggregateByMonth = (entries) => {
  const map = new Map();
  entries.forEach((entry) => {
    if (!entry?.date) return;
    const parsedDate = new Date(entry.date);
    if (Number.isNaN(parsedDate.getTime())) return;
    const key = monthKey(parsedDate);
    const label = parsedDate.toLocaleDateString('en-KE', { month: 'short' });
    const current = map.get(key) ?? { label, value: 0, date: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1).toISOString() };
    current.value += toNumber(entry.value);
    map.set(key, current);
  });
  return Array.from(map.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const periodDays = {
  daily: 14,
  weekly: 56,
  monthly: 180,
};

const extractTrendEntries = (trendData) => {
  if (Array.isArray(trendData)) return trendData;
  if (Array.isArray(trendData?.results)) return trendData.results;
  if (Array.isArray(trendData?.data)) return trendData.data;
  if (Array.isArray(trendData?.trend)) return trendData.trend;
  if (Array.isArray(trendData?.items)) return trendData.items;
  return [];
};

const fetchTrendForPeriod = async (periodKey) => {
  const requestedDays = periodDays[periodKey] ?? 14;
  const attempts = [requestedDays, 30, 7];

  for (const days of attempts) {
    try {
      const response = await getStudentTrend(days);
      const entries = extractTrendEntries(response);
      if (entries.length > 0 || days === attempts[attempts.length - 1]) {
        return entries;
      }
    } catch {
      // Keep trying with smaller windows if the backend rejects larger ranges.
    }
  }

  return [];
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [trend, setTrend] = useState([]);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    Promise.all([
      getPersonalReport().catch(() => null),
      getMyLimits().catch(() => null),
    ])
      .then(([summary, limitData]) => {
        setReport(summary);
        setLimits(limitData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTrendLoading(true);
    fetchTrendForPeriod(period)
      .then((entries) => {
        if (!cancelled) setTrend(entries);
      })
      .catch(() => {
        if (!cancelled) setTrend([]);
      })
      .finally(() => {
        if (!cancelled) setTrendLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

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

  const weeklyTrend = aggregateByWeek(normalizedTrend).slice(-8);
  const monthlyTrend = aggregateByMonth(normalizedTrend).slice(-6);

  const selectedTrend =
    period === 'weekly'
      ? weeklyTrend
      : period === 'monthly'
        ? monthlyTrend
        : normalizedTrend.slice(-14);

  const maxTrend = Math.max(...selectedTrend.map((entry) => entry.value), 1);
  const dailyUtilization = dailyLimit > 0 ? Math.min(100, (toNumber(dailySpend) / toNumber(dailyLimit)) * 100) : 0;
  const trendValues = selectedTrend.map((entry) => entry.value);
  const trendLinePath = buildLinePath(trendValues);
  const totalInSelectedPeriod = trendValues.reduce((sum, value) => sum + value, 0);
  const selectedLabel = period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Daily';

  const rankingData = [...selectedTrend]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/student/home', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Reports</h1>
      </header>

      <div className="px-5 py-4">
        {loading ? (
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <StatCardSkeleton className="bg-[#EFE5AD]" />
              <StatCardSkeleton className="bg-[#F2EED8]" />
            </div>
            <ChartSkeleton height="h-44" className="bg-[#E8E8E8]" />
            <ChartSkeleton height="h-28" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : !report ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No report data</p>
          </Card>
        ) : (
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-[#EFE5AD] p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] text-edueats-textMuted">
                  <FiDollarSign className="text-edueats-text" />
                  <span>{selectedLabel} Spend</span>
                </div>
                <p className="text-lg font-semibold text-edueats-text">Ksh {formatCurrency(totalInSelectedPeriod)}</p>
              </Card>
              <Card className="bg-[#F2EED8] p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] text-edueats-textMuted">
                  <FiShoppingBag className="text-edueats-text" />
                  <span>Orders</span>
                </div>
                <p className="text-lg font-semibold text-edueats-text">{formatCurrency(report?.orders_count ?? 0)}</p>
              </Card>
            </div>

            <Card className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-edueats-text">
                  <FiCalendar />
                  <span>My Analysis</span>
                </div>
                <div className="flex rounded-full border border-edueats-border bg-white p-1">
                  {[
                    { key: 'daily', label: 'Daily' },
                    { key: 'weekly', label: 'Weekly' },
                    { key: 'monthly', label: 'Monthly' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPeriod(item.key)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        period === item.key
                          ? 'bg-edueats-accent text-white'
                          : 'text-edueats-textMuted hover:text-edueats-text'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-edueats-textMuted">
                {period === 'daily' ? 'Amount against day' : 'Amount against week'}
              </p>
            </Card>

            <Card className="border border-edueats-text/40 bg-[#E8E8E8] p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-edueats-text">
                <FiBarChart2 />
                <span>{selectedLabel} Trend</span>
              </div>
              {trendLoading ? (
                <p className="py-8 text-center text-sm text-edueats-textMuted">Loading trend...</p>
              ) : selectedTrend.length === 0 ? (
                <p className="py-8 text-center text-sm text-edueats-textMuted">No trend data available.</p>
              ) : (
                <div className="space-y-3">
                  <div className="h-44 rounded-md border border-edueats-text/30 bg-[#E0E0E0] p-2">
                    <div className="flex h-full items-end justify-between gap-2 overflow-x-auto">
                      {selectedTrend.map((entry, idx) => {
                        const heightPct = Math.max(8, (entry.value / maxTrend) * 100);
                        return (
                          <div key={entry.date ?? idx} className="flex min-w-[34px] flex-1 flex-col items-center gap-1">
                            <span className="text-[10px] text-edueats-textMuted">{entry.value}</span>
                            <div className="flex h-28 w-full items-end rounded-sm bg-[#D4D4D4] px-0.5">
                              <div
                                className="w-full rounded-sm bg-edueats-accent"
                                style={{ height: `${heightPct}%` }}
                                title={`${entry.label}: Ksh ${entry.value}`}
                              />
                            </div>
                            <span className="truncate text-[10px] text-edueats-text">{entry.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-md bg-white p-2">
                    <svg viewBox="0 0 320 120" className="h-28 w-full" role="img" aria-label="Personal spending trend line">
                      <path d={trendLinePath} fill="none" stroke="currentColor" strokeWidth="3" className="text-edueats-accent" />
                      {trendValues.map((value, idx) => {
                        const step = trendValues.length > 1 ? (320 - 24) / (trendValues.length - 1) : 0;
                        const x = 12 + step * idx;
                        const y = 120 - 12 - (value / Math.max(...trendValues, 1)) * (120 - 24);
                        return <circle key={`${idx}-${value}`} cx={x} cy={y} r="3" className="fill-edueats-accent" />;
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </Card>

            <section>
              <h2 className="mb-2 text-sm font-medium text-edueats-text">Top Periods</h2>
              <div className="space-y-2">
                {rankingData.length === 0 ? (
                  <Card>
                    <p className="text-sm text-edueats-textMuted">No ranking data yet</p>
                  </Card>
                ) : (
                  rankingData.map((item, index) => (
                    <Card
                      key={`${item.date ?? item.label}-${index}`}
                      className="rounded-xl border border-edueats-accent bg-edueats-surfaceAlt px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-edueats-accent text-[10px] font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-edueats-text">{item.label}</span>
                        <span className="text-[11px] text-edueats-accent">Ksh {formatCurrency(item.value)}</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <Card className="bg-white p-3">
              <p className="text-xs text-edueats-textMuted">Daily spending</p>
              <p className="text-base font-semibold text-edueats-text">Ksh {formatCurrency(dailySpend)}</p>
              <p className="mt-1 text-xs text-edueats-textMuted">Daily limit: Ksh {formatCurrency(dailyLimit)}</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-edueats-border">
                <div
                  className={`h-full rounded-full ${dailyUtilization >= 100 ? 'bg-edueats-danger' : 'bg-edueats-accent'}`}
                  style={{ width: `${dailyUtilization}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-edueats-textMuted">{dailyUtilization.toFixed(0)}% of daily limit used</p>
              <p className="mt-2 text-xs text-edueats-textMuted">Weekly spending: Ksh {formatCurrency(weeklySpend)}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
