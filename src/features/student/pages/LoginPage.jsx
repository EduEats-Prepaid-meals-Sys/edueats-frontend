import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import ErrorBanner from '../../../components/ErrorBanner.jsx';
import { mapApiError } from '../../../utils/errorMessages.js';
import { login as authLogin, getMe } from '../../../api/modules/authApi.js';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useToast } from '../../../App.jsx';
import { useDarkMode } from '../../../utils/useDarkMode.js';
import AuthLayout from '../../../layout/AuthLayout.jsx';

const getRedirectPath = (roles = []) => {
  const normalized = Array.isArray(roles) ? roles.map((r) => String(r).toLowerCase()) : [];
  if (normalized.includes('admin') || normalized.includes('caterer')) return '/admin/analytics';
  if (normalized.includes('staff') || normalized.includes('waitress')) return '/staff/orders';
  return '/student/home';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { setToast } = useToast();
  const [isDark, toggleDark] = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
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
    <AuthLayout
      header={
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 2) navigate(-1);
                else navigate('/', { replace: true });
              }}
              className="text-edueats-text text-sm"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={toggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <h1 className="mt-3 text-xl font-semibold text-edueats-text">Log In</h1>
        </>
      }
    >
      <Card>
        <p className="mb-4 text-lg font-medium text-edueats-text">Welcome Back!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
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
          <div className="flex justify-between">
            <Link to="/resend-code" className="text-sm text-edueats-textMuted">Resend Code?</Link>
            <Link to="/forgot-password" className="text-sm text-edueats-textMuted">Forgot Password?</Link>
          </div>
          {formError && <ErrorBanner error={formError} />}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-edueats-textMuted">
          Don&apos;t have an account? <Link to="/register" className="text-edueats-accent">Sign Up</Link>
        </p>
        <p className="mt-2 text-center text-sm text-edueats-textMuted">
          Staff account? <Link to="/staff/login" className="text-edueats-accent">Staff Log In</Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
