import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { canSeeStaffTopups } from '../../../auth/accessControl.js';
import { getStaffTopups, acknowledgeTopup } from '../../../api/modules/walletApi.js';
import { useToast } from '../../../App.jsx';
import Card from '../../../components/Card.jsx';
import Button from '../../../components/Button.jsx';
import { PaymentRowSkeleton } from '../../../components/Skeleton.jsx';

export default function StaffTopupsPage() {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const { setToast } = useToast();
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAck, setFilterAck] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const allowed = canSeeStaffTopups(roles);

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterAck) params.acknowledged = filterAck === 'ack';
    setLoading(true);
    getStaffTopups(params)
      .then((data) => setTopups(Array.isArray(data) ? data : []))
      .catch(() => setTopups([]))
      .finally(() => setLoading(false));
  }, [allowed, filterStatus, filterAck]);

  const handleToggleAck = async (topup) => {
    setUpdatingId(topup.topup_id);
    try {
      const nextAck = !topup.is_acknowledged;
      const res = await acknowledgeTopup(topup.topup_id, nextAck);
      const updated = res?.topup ?? topup;
      setTopups((prev) =>
        prev.map((t) => (t.topup_id === updated.topup_id ? updated : t))
      );
      setToast(nextAck ? 'Top-up acknowledged.' : 'Acknowledgement removed.', 'success');
    } catch (err) {
      setToast(err?.message ?? 'Failed to update acknowledgement', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/staff/orders', { replace: true });
    }
  };

  if (!allowed) {
    return (
      <div className="min-h-screen bg-edueats-bg px-6 py-10">
        <button type="button" onClick={handleBack} className="text-edueats-text">
          Back
        </button>
        <Card className="mt-4">
          <p className="text-center text-sm text-edueats-textMuted">
            You do not have permission to manage wallet top-ups.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={handleBack} className="text-edueats-text">
            Back
          </button>
          <h1 className="text-xl font-semibold text-edueats-text truncate">Wallet Top-ups</h1>
          <span className="text-sm text-edueats-textMuted" />
        </div>
      </header>

      <div className="px-6 py-4">
        <Card className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterAck}
            onChange={(e) => setFilterAck(e.target.value)}
            className="rounded border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text"
          >
            <option value="">All acknowledgements</option>
            <option value="ack">Acknowledged</option>
            <option value="unack">Not acknowledged</option>
          </select>
        </Card>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <PaymentRowSkeleton key={i} />
            ))}
          </div>
        ) : topups.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No top-ups found.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {topups.map((t) => (
              <Card key={t.topup_id} className="flex flex-col gap-1 p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-edueats-text">
                      {t.student_username ?? t.student_email ?? 'Student'}
                    </p>
                    <p className="text-xs text-edueats-textMuted">
                      Ref: {t.transaction_ref ?? '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-edueats-text">Ksh {t.amount}</p>
                    <p className="text-xs text-edueats-textMuted">
                      {t.topup_date ? new Date(t.topup_date).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-edueats-textMuted">
                    Status: {t.status?.toUpperCase() ?? 'PENDING'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.is_acknowledged
                          ? 'bg-edueats-success/20 text-edueats-success'
                          : 'bg-edueats-border text-edueats-textMuted'
                      }`}
                    >
                      {t.is_acknowledged ? 'Acknowledged' : 'Not Acknowledged'}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={updatingId === t.topup_id}
                      onClick={() => handleToggleAck(t)}
                    >
                      {updatingId === t.topup_id
                        ? '...'
                        : t.is_acknowledged
                        ? 'Unacknowledge'
                        : 'Acknowledge'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

