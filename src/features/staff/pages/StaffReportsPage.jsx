import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDownload, FiFilter } from 'react-icons/fi';
import { getStaffPopularMeals, getStaffSalesSummary } from '../../../api/modules/reportsApi.js';
import { getStaffPaymentSummary, getStaffPayments } from '../../../api/modules/paymentsApi.js';
import Card from '../../../components/Card.jsx';

const currency = (value) => Number(value ?? 0).toLocaleString('en-KE');

const yyyyMmDd = (date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function StaffReportsPage() {
  const [salesSummary, setSalesSummary] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [popularMeals, setPopularMeals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() - 29);

  const [fromDate, setFromDate] = useState(yyyyMmDd(defaultFrom));
  const [toDate, setToDate] = useState(yyyyMmDd(today));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStaffSalesSummary({ startDate: fromDate, endDate: toDate }).catch(() => null),
      getStaffPaymentSummary({ startDate: fromDate, endDate: toDate }).catch(() => null),
      getStaffPopularMeals({ startDate: fromDate, endDate: toDate, limit: 10 }).catch(() => []),
      getStaffPayments({ paymentType: 'order_payment', startDate: fromDate, endDate: toDate }).catch(() => []),
    ])
      .then(([sales, paymentSummaryData, popular, paymentRows]) => {
        setSalesSummary(sales);
        setPaymentSummary(paymentSummaryData);
        setPopularMeals(Array.isArray(popular) ? popular : []);
        setPayments(Array.isArray(paymentRows) ? paymentRows : []);
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  const totalRevenue =
    Number(paymentSummary?.total_revenue ?? salesSummary?.total_revenue ?? salesSummary?.revenue ?? 0);
  const totalTransactions =
    Number(paymentSummary?.total_transactions ?? salesSummary?.total_transactions ?? salesSummary?.total_orders ?? payments.length);

  const breakdownRows = useMemo(() => {
    return popularMeals
      .map((item) => ({
        name: item?.meal_name ?? item?.name ?? 'Meal',
        revenue: Number(item?.total_revenue ?? item?.revenue ?? item?.amount ?? 0),
        orders: Number(item?.order_count ?? item?.total_quantity ?? item?.count ?? item?.orders ?? 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [popularMeals]);

  const chartData = breakdownRows
    .map((item) => ({
      label: String(item.name ?? 'Meal').slice(0, 9),
      value: Number(item.orders ?? 0),
    }))
    .slice(0, 5);

  const chartMax = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/staff/dashboard" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-3xl font-semibold text-edueats-text">Reports</h1>
      </header>

      <div className="space-y-3 px-6 py-4 pb-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading reports...</p>
        ) : (
          <>
            <Card className="rounded-xl border border-edueats-accent bg-edueats-surface p-3">
              <div className="mb-3 flex items-center gap-2 text-sm text-edueats-textMuted">
                <FiFilter className="text-edueats-accent" />
                <span>Filter By Date</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-edueats-textMuted">
                  <span className="mb-1 block">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="w-full rounded-lg border border-edueats-border bg-white px-2 py-2 text-sm text-edueats-text"
                  />
                </label>
                <label className="text-xs text-edueats-textMuted">
                  <span className="mb-1 block">To</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full rounded-lg border border-edueats-border bg-white px-2 py-2 text-sm text-edueats-text"
                  />
                </label>
              </div>
            </Card>

            <Card className="rounded-xl border border-edueats-accent bg-edueats-accent p-4 text-white">
              <div className="mb-1 flex items-center gap-2 text-xs text-white/90">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/70 text-[10px]">$</span>
                <span>Total Revenue</span>
              </div>
              <p className="text-3xl font-semibold">Ksh {currency(totalRevenue)}</p>
              <p className="text-sm text-white/90">{currency(totalTransactions)} Transactions</p>
            </Card>

            <Card className="rounded-xl bg-edueats-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-edueats-text">Revenue Breakdown</p>
                <span className="text-xs text-edueats-accent">Top items</span>
              </div>
              {breakdownRows.length === 0 ? (
                <p className="text-sm text-edueats-textMuted">No data for selected range</p>
              ) : (
                <div className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto] border-b border-edueats-border pb-1 text-xs font-semibold text-edueats-accent">
                    <span>Item</span>
                    <span>Total Revenue</span>
                  </div>
                  {breakdownRows.map((row, index) => (
                    <div key={`${row.name}-${index}`} className="grid grid-cols-[1fr_auto] border-b border-edueats-border/70 py-1 text-sm text-edueats-text">
                      <span className="truncate pr-3">{row.name}</span>
                      <span>Ksh {currency(row.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-xl border border-edueats-text/40 bg-[#E8E8E8] p-3">
              <p className="mb-2 text-xl font-medium text-edueats-text">Most Ordered Meals</p>
              {chartData.length === 0 ? (
                <p className="py-6 text-center text-sm text-edueats-textMuted">No graph available for selected range</p>
              ) : (
                <div className="h-48 rounded-md border border-edueats-text/30 bg-[#E0E0E0] p-3">
                  <div className="flex h-full items-end justify-between gap-2">
                    {chartData.map((item) => {
                      const heightPct = Math.max(8, (item.value / chartMax) * 100);
                      return (
                        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[10px] text-edueats-textMuted">{item.value}</span>
                          <div className="flex h-32 w-full items-end rounded-sm bg-[#D4D4D4] px-1">
                            <div className="w-full rounded-sm bg-edueats-accent" style={{ height: `${heightPct}%` }} />
                          </div>
                          <span className="text-[10px] text-edueats-text">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-base font-medium text-white hover:bg-indigo-600"
            >
              <FiDownload />
              Export To PDF
            </button>
            <p className="text-center text-xs text-edueats-textMuted">
              Full report PDF export is not yet available from backend. This button prints the current view.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
