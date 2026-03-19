import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import { requestPasswordReset } from '../../../api/modules/authApi.js';
import { useToast } from '../../../App.jsx';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setToast('Enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset({ email: email.trim() });
      setToast('Reset code sent to your email.', 'success');
      navigate('/reset-password', { state: { email: email.trim() } });
    } catch (err) {
      setToast(err?.message ?? 'Failed to send reset code', 'error');
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
              navigate('/login', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Forgot Password</h1>
      </header>
      <div className="px-6 py-6">
        <Card className="max-w-md space-y-4">
          <p className="text-sm text-edueats-textMuted">
            Enter your account email and we will send a reset code.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
