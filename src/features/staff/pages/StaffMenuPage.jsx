import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useToast } from '../../../App.jsx';
import { canManageMenu } from '../../../auth/accessControl.js';
import { getMenu, updateMenuItem, updateDailyMenuEntry, deleteMenuItem, deleteDailyMenuEntry } from '../../../api/modules/menuApi.js';
import Card from '../../../components/Card.jsx';
import Button from '../../../components/Button.jsx';
import Modal from '../../../components/Modal.jsx';
import Input from '../../../components/Input.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiEdit2, FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

export default function StaffMenuPage() {
  const { roles } = useAuth();
  const { setToast } = useToast();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = () => {
    getMenu()
      .then((data) => setMenu(Array.isArray(data) ? data : data?.results ?? []))
      .catch(() => setMenu([]))
      .finally(() => setLoading(false));
  };

  const allowed = canManageMenu(roles);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-edueats-bg px-6 py-10">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <Card className="mt-4">
          <p className="text-center text-sm text-edueats-textMuted">You do not have permission to manage the menu.</p>
        </Card>
      </div>
    );
  }

  const toggleAvailability = (item) => {
    const next = !item.available;
    setUpdatingId(item.daily_menu_id ?? item.id);
    // Update the daily menu entry's availability (not the catalog meal)
    const patchTarget = item.daily_menu_id
      ? updateDailyMenuEntry(item.daily_menu_id, { is_available: next })
      : updateMenuItem(item.meal_id ?? item.id, { is_active: next });
    patchTarget
      .then(() => {
        setMenu((prev) =>
          prev.map((m) =>
            (m.daily_menu_id ?? m.id) === (item.daily_menu_id ?? item.id)
              ? { ...m, available: next, in_stock: next }
              : m
          )
        );
        setToast(next ? 'Marked as available' : 'Marked as out of stock', 'success');
      })
      .catch((err) => setToast(err?.message ?? 'Failed to update availability', 'error'))
      .finally(() => setUpdatingId(null));
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditPrice(String(item.price));
  };

  const savePrice = async () => {
    if (!editingItem) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      setToast('Please enter a valid price', 'error');
      return;
    }
    setUpdatingId(editingItem.meal_id ?? editingItem.id);
    try {
      // Price lives on the catalog meal, not the daily menu entry
      await updateMenuItem(editingItem.meal_id ?? editingItem.id, { price });
      setMenu((prev) =>
        prev.map((m) =>
          (m.meal_id ?? m.id) === (editingItem.meal_id ?? editingItem.id) ? { ...m, price } : m
        )
      );
      setToast('Price updated successfully', 'success');
      setEditingItem(null);
    } catch (err) {
      setToast(err?.message ?? 'Failed to update price', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const item = menu.find((m) => (m.daily_menu_id ?? m.id) === deletingId || (m.meal_id ?? m.id) === deletingId);
    setUpdatingId(deletingId);
    try {
      // Remove from daily menu first (if it has a daily_menu_id), then catalog
      if (item?.daily_menu_id) {
        await deleteDailyMenuEntry(item.daily_menu_id);
      } else {
        await deleteMenuItem(item?.meal_id ?? deletingId);
      }
      setMenu((prev) =>
        prev.filter((m) => (m.daily_menu_id ?? m.id) !== deletingId && (m.meal_id ?? m.id) !== deletingId)
      );
      setToast('Item removed from menu', 'success');
      setDeletingId(null);
    } catch (err) {
      setToast(err?.message ?? 'Failed to delete item', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-6 pt-10 pb-4">
        <div className="flex items-center justify-between">
          <Link to="/staff/orders" className="text-edueats-text">Back</Link>
          <h1 className="text-xl font-semibold text-edueats-text truncate">Menu Management</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="px-6 py-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : menu.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No menu items</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {menu.map((m) => {
              const available = m.available !== false && m.in_stock !== false;
              const itemKey = m.daily_menu_id ?? m.meal_id ?? m.id;
              return (
                <Card key={itemKey} className="flex flex-row items-center gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-edueats-border">
                    <img
                      src={m.image_url || m.meal_photo_url || m.imageUrl || foodPlaceholder}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.src = foodPlaceholder;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-edueats-text">{m.name}</p>
                    <p className="text-sm text-edueats-textMuted">Ksh {m.price}</p>
                    <p className="text-xs text-edueats-textMuted capitalize">{m.meal_type ?? m.category ?? ''}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      available ? 'bg-edueats-success/20 text-edueats-success' : 'bg-edueats-danger/20 text-edueats-danger'
                    }`}
                  >
                    {available ? 'Available' : 'Out of Stock'}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      disabled={updatingId === itemKey}
                      className="rounded p-2 hover:bg-edueats-border text-edueats-text disabled:opacity-50"
                      aria-label="Edit price"
                      title="Edit price"
                    >
                      <FiEdit2 aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(m)}
                      disabled={updatingId === itemKey}
                      className={`rounded p-2 ${
                        available ? 'hover:bg-red-100 text-red-600' : 'hover:bg-green-100 text-green-600'
                      } disabled:opacity-50`}
                      aria-label={available ? 'Mark out of stock' : 'Mark available'}
                      title={available ? 'Mark out of stock' : 'Mark available'}
                    >
                      {available ? '✕' : '✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(itemKey)}
                      disabled={updatingId === itemKey}
                      className="rounded p-2 hover:bg-edueats-border text-edueats-danger disabled:opacity-50"
                      aria-label="Delete"
                      title="Delete item"
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Price Modal */}
      {editingItem && (
        <Modal onClose={() => setEditingItem(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-edueats-text">Edit Price</h2>
            <p className="text-sm text-edueats-textMuted">{editingItem.name}</p>
            <Input
              label="Price (Ksh)"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="0"
              min="0"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setEditingItem(null)}
                fullWidth
                disabled={updatingId === editingItem.id}
              >
                Cancel
              </Button>
              <Button
                onClick={savePrice}
                fullWidth
                disabled={updatingId === editingItem.id}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal onClose={() => setDeletingId(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-edueats-text">Remove Item?</h2>
            <p className="text-sm text-edueats-textMuted">
              Are you sure you want to remove this item from the menu? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeletingId(null)}
                fullWidth
                disabled={updatingId === deletingId}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                fullWidth
                disabled={updatingId === deletingId}
                className="bg-edueats-danger hover:bg-edueats-danger/90"
              >
                Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Floating Add Button */}
      <Link
        to="/staff/menu/add"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-edueats-accent text-white shadow-lg hover:bg-edueats-accent/90 hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Add Meal"
      >
        <FiPlus className="text-xl font-bold" />
      </Link>
    </div>
  );
}
