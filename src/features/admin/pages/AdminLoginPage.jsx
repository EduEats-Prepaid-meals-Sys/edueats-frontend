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
import { canUseAdminApp } from '../../../auth/accessControl.js';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState(null);

  const from = location.state?.from;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const res = await authLogin({ ...form, role: 'admin' });
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
        nextRoles = me?.roles ?? me?.user?.role ? [me.user.role] : res?.roles ?? [];
        login({ token, refreshToken, user: nextUser, roles: nextRoles });
      } catch {
        login({ token, refreshToken, user: nextUser, roles: nextRoles });
      }

      if (from && canUseAdminApp(nextRoles)) {
        navigate(from, { replace: true });
      } else {
        navigate('/admin/analytics', { replace: true });
      }
    } catch (err) {
      setFormError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <button type="button" onClick={handleBack} className="text-edueats-text">
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Admin Log In</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md">
          <p className="mb-4 text-lg font-medium text-edueats-text">Admin Access</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {formError && <ErrorBanner error={formError} />}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-edueats-textMuted">
            Not an admin? <Link to="/login" className="text-edueats-accent">Student/Staff Log In</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

