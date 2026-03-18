import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import { useToast } from '../../../App.jsx';
import { getMyLimits, setLimits } from '../../../api/modules/limitsApi.js';
import { getPersonalReport } from '../../../api/modules/reportsApi.js';

const isStaff = (path) => path.startsWith('/staff');
const isAdmin = (path) => path.startsWith('/admin');

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { setToast } = useToast();
  const location = useLocation();
  const name = user?.name ?? user?.username ?? user?.email ?? 'User';
  const isStudent = !isStaff(location.pathname) && !isAdmin(location.pathname);
  const roleLabel = isAdmin(location.pathname) ? 'Admin' : isStaff(location.pathname) ? 'Staff' : 'Student';
  const backTo = isStaff(location.pathname) ? '/staff/orders' : isAdmin(location.pathname) ? '/admin/analytics' : '/student/home';

  const [dailyLimit, setDailyLimit] = useState('');
  const [limitLoading, setLimitLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!isStudent) return;

    getMyLimits()
      .then((data) => {
        const limit = data?.daily_limit ?? data?.dailyLimit ?? '';
        setDailyLimit(limit === null || limit === undefined ? '' : String(limit));
      })
      .catch(() => {
        setDailyLimit('');
      });

    getPersonalReport()
      .then((data) => setReport(data ?? null))
      .catch(() => setReport(null));
  }, [isStudent]);

  const handleSaveLimit = async () => {
    const value = Number(dailyLimit);
    if (!Number.isFinite(value) || value <= 0) {
      setToast('Enter a valid daily limit amount.', 'error');
      return;
    }

    setLimitLoading(true);
    try {
      await setLimits({ daily_limit: value });
      setToast('Daily limit updated.', 'success');
    } catch (err) {
      setToast(err?.message ?? 'Failed to update daily limit.', 'error');
    } finally {
      setLimitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to={backTo} className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Settings</h1>
      </header>

      <div className="px-6 py-6">
        <Card className="mb-4 flex flex-row items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-edueats-border" />
          <div>
            <p className="font-semibold text-edueats-text uppercase">{name}</p>
            <p className="text-sm text-edueats-textMuted">{roleLabel}</p>
          </div>
        </Card>

        <Card className="space-y-0">
          <p className="mb-2 text-xs font-medium uppercase text-edueats-textMuted">Account</p>
          <Link
            to={isStaff(location.pathname) ? '/staff/profile' : '/student/profile'}
            className="block py-2 text-edueats-text"
          >
            Edit profile
          </Link>
        </Card>

        <Card className="mt-4 space-y-0">
          <p className="mb-2 text-xs font-medium uppercase text-edueats-textMuted">General</p>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2 py-2 text-left text-edueats-accent"
          >
            Log out
          </button>
        </Card>

        {isStudent && (
          <Card className="mt-4 space-y-4">
            <p className="text-xs font-medium uppercase text-edueats-textMuted">Spending & Reports</p>
            <div>
              <Input
                label="Daily Spending Limit (Ksh)"
                type="number"
                min="1"
                step="1"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="Enter daily limit"
              />
              <div className="mt-2">
                <Button onClick={handleSaveLimit} disabled={limitLoading}>
                  {limitLoading ? 'Saving...' : 'Save Daily Limit'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-edueats-border p-3">
              <p className="text-sm text-edueats-textMuted">Report Snapshot</p>
              <p className="mt-1 text-sm text-edueats-text">
                Total spent: <span className="font-medium">Ksh {report?.total_spent ?? 0}</span>
              </p>
              <p className="text-sm text-edueats-text">
                Orders count: <span className="font-medium">{report?.orders_count ?? 0}</span>
              </p>
              <Link to="/student/reports" className="mt-2 inline-block text-sm text-edueats-accent">
                Open full reports
              </Link>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <Button fullWidth variant="primary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
