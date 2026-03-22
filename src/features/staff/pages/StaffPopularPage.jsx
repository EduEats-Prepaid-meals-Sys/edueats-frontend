import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMessReport } from '../../../api/modules/reportsApi.js';
import { getLiveOrders } from '../../../api/modules/ordersApi.js';
import Card from '../../../components/Card.jsx';
import { FiBarChart2, FiDollarSign, FiShoppingBag } from 'react-icons/fi';

const toAmount = (order) => Number(order?.total_amount ?? order?.total ?? order?.amount ?? 0);

const isSameDay = (value) => {
  if (!value) return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isRevenueStatus = (status) => ['paid', 'served', 'completed'].includes(String(status || '').toLowerCase());

const compactNumber = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('en-KE');
};

export default function StaffPopularPage() {
  const [report, setReport] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMessReport().catch(() => null),
      getLiveOrders().catch(() => []),
    ])
      .then(([mess, orders]) => {
        setReport(mess);
        setLiveOrders(Array.isArray(orders) ? orders : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const apiRevenue = Number(report?.revenue_today ?? report?.revenue ?? 0);
  const derivedRevenue = liveOrders
    .filter((order) => isRevenueStatus(order?.status) && isSameDay(order?.created_at ?? order?.ordered_at))
    .reduce((sum, order) => sum + toAmount(order), 0);

  const revenue = derivedRevenue > 0 ? derivedRevenue : apiRevenue;
  const totalOrders = liveOrders.length > 0
    ? liveOrders.filter((order) => isSameDay(order?.created_at ?? order?.ordered_at)).length
    : report?.total_orders ?? report?.orders_count ?? 0;
  const ranking = report?.ranking ?? report?.top_items ?? [];
  const usingDerivedRevenue = derivedRevenue > 0 && derivedRevenue !== apiRevenue;
  const chartData = ranking
    .slice(0, 5)
    .map((item, index) => ({
      id: item?.id ?? index,
      label: String(item?.name ?? item?.meal_name ?? `Meal ${index + 1}`).slice(0, 10),
      value: Number(item?.count ?? item?.orders ?? 0),
    }));
  const chartMax = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Popular Meals</h1>
      </header>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-[#EFE5AD] p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] text-edueats-textMuted">
              <FiDollarSign className="text-edueats-text" />
              <span>Revenue Today</span>
            </div>
            <p className="text-lg font-semibold text-edueats-text">Ksh {compactNumber(revenue)}</p>
            {usingDerivedRevenue && (
              <p className="mt-1 text-[10px] text-edueats-textMuted">Derived from paid/served orders</p>
            )}
          </Card>
          <Card className="bg-[#F2EED8] p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px] text-edueats-textMuted">
              <FiShoppingBag className="text-edueats-text" />
              <span>Total Orders</span>
            </div>
            <p className="text-lg font-semibold text-edueats-text">{compactNumber(totalOrders)}</p>
          </Card>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Card className="border border-edueats-text/40 bg-[#E8E8E8] p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-edueats-text">
                <FiBarChart2 />
                <span>Today</span>
              </div>
              {chartData.length === 0 ? (
                <p className="py-8 text-center text-sm text-edueats-textMuted">No chart data yet</p>
              ) : (
                <div className="space-y-2">
                  <div className="h-40 rounded-md border border-edueats-text/30 bg-[#E0E0E0] p-2">
                    <div className="flex h-full items-end justify-between gap-2">
                      {chartData.map((item) => {
                        const heightPct = Math.max(8, (item.value / chartMax) * 100);
                        return (
                          <div key={item.id} className="flex flex-1 flex-col items-center gap-1">
                            <span className="text-[10px] text-edueats-textMuted">{item.value}</span>
                            <div className="flex h-28 w-full items-end rounded-sm bg-[#D4D4D4] px-0.5">
                              <div
                                className="w-full rounded-sm bg-edueats-accent"
                                style={{ height: `${heightPct}%` }}
                                title={`${item.label}: ${item.value} orders`}
                              />
                            </div>
                            <span className="truncate text-[10px] text-edueats-text">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <section>
              <h2 className="mb-2 text-sm font-medium text-edueats-text">Ranking</h2>
              <div className="space-y-2">
                {ranking.length === 0 ? (
                  <Card>
                    <p className="text-sm text-edueats-textMuted">No data yet</p>
                  </Card>
                ) : (
                  ranking.slice(0, 10).map((item, i) => (
                    <Card
                      key={item.id ?? item.name ?? i}
                      className="rounded-xl border border-edueats-accent bg-edueats-surfaceAlt px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-edueats-accent text-[10px] font-semibold text-white">
                          {i + 1}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium text-edueats-text">
                          {item.name ?? item.meal_name ?? `Item ${i + 1}`}
                        </span>
                        <span className="text-[11px] text-edueats-accent">
                          {item.count ?? item.orders ?? 0} Orders
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
