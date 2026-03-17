import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import Toast from './components/Toast.jsx';

const CartContext = createContext(undefined);
const ToastContext = createContext(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const cartItem = (item, qty) => ({
  menuItemId: item.id ?? item.meal_id,
  daily_menu_id: item.daily_menu_id,   // needed for order creation
  quantity: qty,
  name: item.name || item.title || 'Item',
  price: Number(item.price) || 0,
  meal_type: item.meal_type || item.category || item.mealType || '',
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item, quantity = 1) => {
    setItems((prev) => {
      const id = item.id ?? item.menuItemId;
      const existing = prev.find((i) => i.menuItemId === id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, cartItem(item, quantity)];
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId, delta) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const cartValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    [items, addItem, removeItem, updateQuantity, clear]
  );

  return <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>;
}

export function ToastProvider({ children }) {
  const [toast, setToastState] = useState({ message: '', variant: 'info' });

  const setToast = useCallback((message, variant = 'info') => {
    setToastState({ message: String(message), variant });
  }, []);

  const value = useMemo(() => ({ toast, setToast }), [toast, setToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={toast.message} variant={toast.variant} />
    </ToastContext.Provider>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-edueats-bg text-edueats-text">
      <div className="mx-auto max-w-6xl lg:max-w-5xl xl:max-w-4xl">
        <CartProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </div>
    </div>
  );
}

export default App;
