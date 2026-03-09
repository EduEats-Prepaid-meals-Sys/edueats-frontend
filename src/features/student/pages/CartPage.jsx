import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useCart, useToast } from '../../../App.jsx';
import { createOrder } from '../../../api/modules/ordersApi.js';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Modal from '../../../components/Modal.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);
  const balanceAfter = balance - total;

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setInsufficientBalance(false);
    setLimitExceeded(false);
    try {
      const payload = {
        items: items.map((i) => ({ menu_item_id: i.menuItemId, quantity: i.quantity })),
      };
      await createOrder(payload);
      clear();
      setOrderPlaced(true);
      setToast('Order placed successfully', 'success');
    } catch (err) {
      if (err?.status === 402) {
        setInsufficientBalance(true);
      } else if (err?.status === 403) {
        setLimitMessage(err?.message ?? 'Daily or weekly limit exceeded.');
        setLimitExceeded(true);
      } else if (err?.status === 401) {
        return;
      } else {
        setToast(err?.message ?? 'Order failed. Try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced && items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <p className="text-lg font-medium text-edueats-text">Order confirmed</p>
        <p className="mt-1 text-sm text-edueats-textMuted">Thank you for your order.</p>
        <Link to="/student/menu" className="mt-6">
          <Button>Order again</Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
        <p className="text-edueats-textMuted">Your cart is empty</p>
        <Link to="/student/menu" className="mt-4">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <Link to="/student/menu" className="text-edueats-text">Back</Link>
          <h1 className="text-xl font-semibold text-edueats-text">My Cart</h1>
        </div>
      </header>

      <div className="px-6 py-4">
        <div className="space-y-4">
          {items.map((i) => (
            <Card key={i.menuItemId} className="flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-lg bg-edueats-border" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-edueats-text">{i.name}</p>
                <p className="text-sm text-edueats-textMuted">Ksh {i.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(i.menuItemId, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-edueats-border text-edueats-text"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-medium">{i.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(i.menuItemId, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-edueats-border text-edueats-text"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(i.menuItemId)}
                className="text-edueats-textMuted"
                aria-label="Remove"
              >
                Remove
              </button>
            </Card>
          ))}
        </div>

        <Card className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-edueats-textMuted">Subtotal</span>
            <span className="font-medium text-edueats-text">Ksh {total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-edueats-textMuted">Current Bal</span>
            <span className="text-edueats-text">Ksh {balance}</span>
          </div>
          <div className="border-t border-edueats-border pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-edueats-textMuted">Bal After</span>
              <span className="font-medium text-edueats-text">Ksh {balanceAfter}</span>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Button
            fullWidth
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? 'Placing order...' : `Confirm order - Ksh ${total}`}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={insufficientBalance}
        title="Insufficient balance"
        onClose={() => setInsufficientBalance(false)}
        primaryAction={{
          label: 'Top Up Wallet',
          onClick: () => {
            setInsufficientBalance(false);
            navigate('/student/wallet');
          },
        }}
        secondaryAction={{ label: 'Cancel', onClick: () => setInsufficientBalance(false) }}
      >
        Your wallet balance is too low for this order. Top up to continue.
      </Modal>

      <Modal
        isOpen={limitExceeded}
        title="Limit exceeded"
        onClose={() => setLimitExceeded(false)}
        primaryAction={{
          label: 'Adjust Limits',
          onClick: () => {
            setLimitExceeded(false);
            navigate('/student/limits');
          },
        }}
        secondaryAction={{ label: 'Cancel', onClick: () => setLimitExceeded(false) }}
      >
        {limitMessage}
      </Modal>
    </div>
  );
}
