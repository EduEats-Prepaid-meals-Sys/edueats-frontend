import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useCart, useToast } from '../../../App.jsx';
import { createOrder, checkoutOrder } from '../../../api/modules/ordersApi.js';
import { mapApiError } from '../../../utils/errorMessages.js';
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
  const [orderError, setOrderError] = useState(null); // { title, detail, action, actionPath, category }

  const balance = Number(user?.wallet_balance ?? user?.balance ?? 0);
  const balanceAfter = balance - total;

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setOrderError(null);
    try {
      // New 2-step flow: create draft per item, then checkout the last one
      // (Backend merges duplicates for the same daily_menu entry)
      let lastOrderId = null;
      for (const i of items) {
        const payload = {
          quantity: i.quantity,
          ...(i.daily_menu_id ? { daily_menu_id: i.daily_menu_id } : { meal_id: i.menuItemId }),
        };
        const res = await createOrder(payload);
        lastOrderId = res?.order?.order_id ?? res?.order_id ?? lastOrderId;
      }

      // Checkout: deducts wallet and sets status to pending
      if (lastOrderId) {
        await checkoutOrder(lastOrderId);
      }

      clear();
      setOrderPlaced(true);
      setToast('Order placed successfully', 'success');
    } catch (err) {
      if (err?.status === 401) return;
      const mapped = mapApiError(err, { balance, total });
      if (mapped.category === 'business' || mapped.category === 'not_found') {
        setOrderError(mapped);
      } else {
        setToast(mapped.title + (mapped.detail ? ` — ${mapped.detail}` : ''), 'error');
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
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate('/student/menu', { replace: true });
              }
            }}
            className="text-edueats-text"
          >
            Back
          </button>
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
        isOpen={orderError !== null}
        title={orderError?.title ?? 'Order failed'}
        onClose={() => setOrderError(null)}
        primaryAction={orderError?.actionPath ? {
          label: orderError.action,
          onClick: () => { setOrderError(null); navigate(orderError.actionPath); },
        } : {
          label: 'OK',
          onClick: () => setOrderError(null),
        }}
        secondaryAction={orderError?.actionPath ? { label: 'Cancel', onClick: () => setOrderError(null) } : undefined}
      >
        <p className="text-sm text-edueats-textMuted">
          {orderError?.detail ?? 'Something went wrong placing your order.'}
        </p>
        {orderError?.action && !orderError?.actionPath && (
          <p className="mt-2 text-xs font-medium text-edueats-textMuted">{orderError.action}</p>
        )}
      </Modal>
    </div>
  );
}
