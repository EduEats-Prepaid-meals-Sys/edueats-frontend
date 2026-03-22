import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import ErrorBanner from '../../../components/ErrorBanner.jsx';
import { mapApiError } from '../../../utils/errorMessages.js';
import { login as authLogin, getMe } from '../../../api/modules/authApi.js';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { canUseAdminApp, canUseStaffApp, hasCapability } from '../../../auth/accessControl.js';
import { useToast } from '../../../App.jsx';

const getRedirectPath = (roles = []) => {
  if (canUseAdminApp(roles)) return '/admin/analytics';
  if (canUseStaffApp(roles)) {
    return hasCapability(roles, 'staff:reports') ? '/staff/dashboard' : '/staff/orders';
  }
  return '/student/home';
};

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ staff_id: '', password: '' });
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const res = await authLogin(form);
      const token = res?.tokens?.access ?? res?.access ?? res?.token;
      const refreshToken = res?.tokens?.refresh ?? res?.refresh;
      if (!token) {
        setToast('Invalid login response', 'error');
        return;
      }
      let nextUser = res?.user ?? {};
      let nextRoles = res?.roles ?? [];

      login({ token, refreshToken, user: nextUser, roles: nextRoles });
      try {
        const me = await getMe();
        nextUser = me?.user ?? me ?? {};
        nextRoles = me?.roles ?? me?.user?.roles ?? res?.roles ?? [];
        login({ token, refreshToken, user: nextUser, roles: nextRoles });
      } catch {
        login({ token, refreshToken, user: nextUser, roles: nextRoles });
      }
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(getRedirectPath(nextRoles), { replace: true });
      }
    } catch (err) {
      setFormError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Log In</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          <p className="mb-4 text-lg font-medium text-edueats-text">Welcome Back!</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff ID"
              name="staff_id"
              value={form.staff_id}
              onChange={handleChange}
              placeholder="Enter staff ID"
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-edueats-textMuted"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-edueats-textMuted">Forgot Password?</Link>
            </div>
            {formError && <ErrorBanner error={formError} />}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-edueats-textMuted">
            Don&apos;t have an account? <Link to="/staff/register" className="text-edueats-accent">Sign Up</Link>
          </p>
          <p className="mt-2 text-center text-sm text-edueats-textMuted">
            Student account? <Link to="/login" className="text-edueats-accent">Student Log In</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
