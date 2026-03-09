import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';

const isStaff = (path) => path.startsWith('/staff');
const isAdmin = (path) => path.startsWith('/admin');

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const name = user?.name ?? user?.username ?? user?.email ?? 'User';
  const roleLabel = isAdmin(location.pathname) ? 'Admin' : isStaff(location.pathname) ? 'Staff' : 'Student';
  const backTo = isStaff(location.pathname) ? '/staff/orders' : isAdmin(location.pathname) ? '/admin/analytics' : '/student/home';

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

        <div className="mt-6">
          <Button fullWidth variant="primary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}
