import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { setLimits } from '../../../api/modules/limitsApi.js';
import { useToast } from '../../../App.jsx';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import Card from '../../../components/Card.jsx';

export default function LimitsPage() {
  const { setToast } = useToast();
  const [daily, setDaily] = useState('');
  const [weekly, setWeekly] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const d = daily ? Number(daily) : undefined;
    const w = weekly ? Number(weekly) : undefined;
    if (d === undefined && w === undefined) {
      setToast('Set at least one limit', 'error');
      return;
    }
    setLoading(true);
    try {
      await setLimits({ daily_limit: d, weekly_limit: w });
      setToast('Limits updated', 'success');
      setDaily('');
      setWeekly('');
    } catch (err) {
      setToast(err?.message ?? 'Failed to update limits', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-6">
        <Link to="/student/home" className="text-edueats-text">Back</Link>
        <h1 className="mt-2 text-xl font-semibold text-edueats-text">Limits</h1>
      </header>

      <div className="px-6 py-6">
        <Card>
          <h2 className="mb-4 text-lg font-medium text-edueats-text">Spending limits</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Daily limit (Ksh)"
              type="number"
              min="0"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              placeholder="Optional"
            />
            <Input
              label="Weekly limit (Ksh)"
              type="number"
              min="0"
              value={weekly}
              onChange={(e) => setWeekly(e.target.value)}
              placeholder="Optional"
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Saving...' : 'Save limits'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
