import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import { login as authLogin, getMe } from '../../../api/modules/authApi.js';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useToast } from '../../../App.jsx';

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';

const getRedirectPath = (roles = []) => {
  const normalized = Array.isArray(roles) ? roles.map((r) => String(r).toLowerCase()) : [];
  if (normalized.includes('admin') || normalized.includes('caterer')) return '/admin/analytics';
  if (normalized.includes('staff') || normalized.includes('waitress')) return '/staff/orders';
  return '/student/home';
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, devLogin } = useAuth();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authLogin(form);
      const token = res?.tokens?.access ?? res?.access ?? res?.token;
      if (!token) {
        setToast('Invalid login response', 'error');
        return;
      }
      let nextUser = res?.user ?? {};
      let nextRoles = res?.roles ?? [];

      login({ token, user: nextUser, roles: nextRoles });
      try {
        const me = await getMe();
        nextUser = me?.user ?? me ?? {};
        nextRoles = me?.roles ?? me?.user?.roles ?? res?.roles ?? [];
        login({ token, user: nextUser, roles: nextRoles });
      } catch {
        login({ token, user: nextUser, roles: nextRoles });
      }
      navigate(getRedirectPath(nextRoles), { replace: true });
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <Link to="/" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Log In</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          <p className="mb-4 text-lg font-medium text-edueats-text">Welcome Back!</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              error={error && !form.password ? error : undefined}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              error={error && form.email ? error : undefined}
            />
            <div className="text-right">
              <Link to="/register" className="text-sm text-edueats-textMuted">Forgot Password?</Link>
            </div>
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
          {IS_MOCK && devLogin && (
            <div className="mt-6 border-t border-edueats-border pt-4">
              <p className="mb-2 text-xs font-medium uppercase text-edueats-textMuted">Dev Test Mode</p>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" onClick={() => devLogin('student')}>
                  Continue as Student
                </Button>
                <Button variant="secondary" onClick={() => devLogin('staff')}>
                  Continue as Staff
                </Button>
                <Button variant="secondary" onClick={() => devLogin('admin')}>
                  Continue as Admin
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
