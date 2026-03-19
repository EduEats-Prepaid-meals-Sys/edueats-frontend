import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import { resetPasswordWithCode } from '../../../api/modules/authApi.js';
import { useToast } from '../../../App.jsx';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToast } = useToast();
  const [form, setForm] = useState({
    email: location.state?.email ?? '',
    code: '',
    new_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.code.trim() || !form.new_password) {
      setToast('Fill all fields to reset password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode({
        email: form.email.trim(),
        code: form.code.trim(),
        new_password: form.new_password,
      });
      setToast('Password reset successful. Please log in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setToast(err?.message ?? 'Failed to reset password', 'error');
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
              navigate('/forgot-password', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Reset Password</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Input
              label="Reset Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="6-digit code"
            />
            <Input
              label="New Password"
              name="new_password"
              type={showPassword ? 'text' : 'password'}
              value={form.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
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
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
