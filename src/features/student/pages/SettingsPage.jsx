import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import { useToast } from '../../../App.jsx';
import { getMyLimits, setLimits } from '../../../api/modules/limitsApi.js';

const isStaff = (path) => path.startsWith('/staff');
const isAdmin = (path) => path.startsWith('/admin');

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { setToast } = useToast();
  const location = useLocation();
  const name = user?.name ?? user?.full_name ?? user?.username ?? 'User';
  const isStudent = !isStaff(location.pathname) && !isAdmin(location.pathname);
  const roleLabel = isAdmin(location.pathname) ? 'Admin' : isStaff(location.pathname) ? 'Staff' : 'Student';
  const backTo = isStaff(location.pathname) ? '/staff/orders' : isAdmin(location.pathname) ? '/admin/analytics' : '/student/home';

  const [dailyLimit, setDailyLimit] = useState('');
  const [initialDailyLimit, setInitialDailyLimit] = useState('');
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);

  useEffect(() => {
    if (!isStudent) return;

    getMyLimits()
      .then((data) => {
        const limit = data?.daily_limit ?? data?.dailyLimit ?? '';
        const normalized = limit === null || limit === undefined ? '' : String(limit);
        setDailyLimit(normalized);
        setInitialDailyLimit(normalized);
      })
      .catch(() => {
        setDailyLimit('');l
        setInitialDailyLimit('');
      });
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
      setInitialDailyLimit(String(value));
      setIsEditingLimit(false);
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
        <Card className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-edueats-border" />
          <div className="min-w-0">
            <p className="break-words text-base font-semibold text-edueats-text">{name}</p>
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
            <p className="text-xs font-medium uppercase text-edueats-textMuted">Daily Spending</p>
            <div>
              <Input
                label="Daily Spending Limit (Ksh)"
                type="number"
                min="1"
                step="1"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                placeholder="Enter daily limit"
                disabled={!isEditingLimit || limitLoading}
              />
              <div className="mt-2 flex gap-2">
                {!isEditingLimit ? (
                  <Button onClick={() => setIsEditingLimit(true)} disabled={limitLoading}>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSaveLimit} disabled={limitLoading}>
                      {limitLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDailyLimit(initialDailyLimit);
                        setIsEditingLimit(false);
                      }}
                      disabled={limitLoading}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
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
