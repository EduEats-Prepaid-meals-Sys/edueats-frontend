import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { topUp, pollTopUpStatus } from '../../../api/modules/walletApi.js';
import { useToast } from '../../../App.jsx';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { setToast } = useToast();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 10) {
      setToast('Enter a valid amount (minimum Ksh 10).', 'error');
      return;
    }
    if (!phoneNumber.trim()) {
      setToast('Enter a phone number', 'error');
      return;
    }
    setLoading(true);
    setStatusMsg('');
    try {
      const res = await topUp({ amount: value, phone_number: phoneNumber.trim() });
      const ref =
        res?.transaction_ref ??
        res?.reference ??
        res?.checkout_request_id ??
        null;

      if (ref) {
        setStatusMsg('STK push sent. Waiting for M-PESA confirmation…');
        const result = await pollTopUpStatus(ref);
        if (result.success) {
          setToast('Top-up successful! Your balance has been updated.', 'success');
          setAmount('');
          setPhoneNumber('');
          refreshUser();
        } else {
          setToast(result.error ?? 'Top-up could not be confirmed. Please try again.', 'error');
        }
      } else {
        // Backend did not return a trackable ref — fall back to simple confirmation
        setToast('Top-up request sent', 'success');
        setAmount('');
        setPhoneNumber('');
        refreshUser();
      }
    } catch (err) {
      setToast(err?.message ?? 'Top-up failed', 'error');
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 2) {
              navigate(-1);
            } else {
              navigate('/student/home', { replace: true });
            }
          }}
          className="text-edueats-text"
        >
          Back
        </button>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Wallet</h1>
        <Card className="mt-4 bg-edueats-surfaceAlt/90">
          <p className="text-sm text-edueats-textMuted">Current balance</p>
          <p className="text-2xl font-bold text-edueats-text">Ksh {balance}</p>
        </Card>
      </header>

      <div className="px-6 py-6">
        <Card>
          <h2 className="mb-4 text-lg font-medium text-edueats-text">Top up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Amount (Ksh)"
              type="number"
              min="10"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 07XXXXXXXX"
            />
            <Button type="submit" fullWidth disabled={loading} className="text-black">
              {statusMsg || (loading ? 'Processing...' : 'Top Up')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
