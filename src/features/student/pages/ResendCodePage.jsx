import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import ErrorBanner from '../../../components/ErrorBanner.jsx';
import { useToast } from '../../../App.jsx';
import { resendVerificationCode } from '../../../api/modules/authApi.js';
import { isValidEmail } from '../../../utils/validators.js';

export default function ResendCodePage() {
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resendVerificationCode({ email: normalizedEmail });
      setToast('Verification code sent to your email.', 'success');
      navigate('/verify-code', { state: { email: normalizedEmail } });
    } catch (err) {
      setError(err?.message ?? 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <Link to="/login" className="text-edueats-text">
          Back
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Resend Verification Code</h1>
      </header>

      <div className="px-6 py-6">
        <Card className="max-w-md space-y-4">
          <p className="text-lg font-medium text-edueats-text">Get verification code</p>
          <p className="text-sm text-edueats-textMuted">
            Enter the email address associated with your account to receive a verification code.
          </p>

          {error && <ErrorBanner error={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Enter your email"
              autoComplete="email"
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </form>

          <p className="text-center text-sm text-edueats-textMuted">
            Don&apos;t have an account? <Link to="/register" className="text-edueats-accent">Sign Up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
