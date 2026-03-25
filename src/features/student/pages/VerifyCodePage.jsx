import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';
import { useToast } from '../../../App.jsx';
import { verifyEmailCode, resendVerificationCode } from '../../../api/modules/authApi.js';

export default function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email = location.state?.email ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedCode = code.replace(/\D/g, '').slice(0, 6);

    if (normalizedCode.length !== 6) {
      setToast('Please enter a valid 6-digit code.', 'error');
      return;
    }
    if (!email) {
      setToast('Email is missing. Please start from signup again.', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailCode({ email, code: normalizedCode });
      setToast('Email verified successfully. Please log in.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setToast(err?.message ?? 'Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setToast('Email is missing. Please start from signup again.', 'error');
      return;
    }
    setResending(true);
    try {
      await resendVerificationCode({ email });
      setToast('Verification code resent.', 'success');
    } catch (err) {
      setToast(err?.message ?? 'Failed to resend verification code.', 'error');
    } finally {
      setResending(false);
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
              navigate('/verify-email', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Enter Verification Code</h1>
      </header>

      <div className="px-6 py-6">
        <Card className="max-w-md space-y-4">
          <p className="text-sm text-edueats-textMuted">
            Enter the 6-digit code sent to your email account.
          </p>
          {email ? (
            <p className="rounded-lg bg-edueats-surface px-3 py-2 text-sm text-edueats-text">{email}</p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Verification Code"
              name="verification_code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="space-y-2 text-center text-sm text-edueats-textMuted">
            <p>
              Didn&apos;t receive a code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-edueats-accent disabled:opacity-60"
              >
                {resending ? 'Resending...' : 'Resend code'}
              </button>
            </p>
            <p>
              Wrong email?{' '}
              <Link to="/resend-code" className="text-edueats-accent">
                Use different email
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
