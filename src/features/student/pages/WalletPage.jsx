import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { topUp } from '../../../api/modules/walletApi.js';
import { useToast } from '../../../App.jsx';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const { setToast } = useToast();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setToast('Enter a valid amount', 'error');
      return;
    }
    setLoading(true);
    try {
      await topUp({ amount: value });
      setToast('Top-up request sent', 'success');
      setAmount('');
      refreshUser();
    } catch (err) {
      setToast(err?.message ?? 'Top-up failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/student/home" className="text-edueats-text">Back</Link>
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
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Processing...' : 'Top Up'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
