import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email ?? '';

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="bg-edueats-primary px-6 py-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/register', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Verify Your Email</h1>
      </header>

      <div className="px-6 py-6">
        <Card className="max-w-md space-y-4">
          <p className="text-lg font-medium text-edueats-text">Check your email</p>
          <p className="text-sm text-edueats-textMuted">
            We queued a verification email to your account.
          </p>
          {email ? (
            <p className="rounded-lg bg-edueats-surface px-3 py-2 text-sm text-edueats-text">
              {email}
            </p>
          ) : null}
          <p className="text-sm text-edueats-textMuted">
            Enter the 6-digit code to verify your account and continue to login.
          </p>

          <Button fullWidth onClick={() => navigate('/verify-code', { state: { email } })}>
            Enter Verification Code
          </Button>

          <p className="text-center text-sm text-edueats-textMuted">
            Already verified? <Link to="/login" className="text-edueats-accent">Go to Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
