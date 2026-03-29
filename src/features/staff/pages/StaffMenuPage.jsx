import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import { useToast } from '../../../App.jsx';
import { canManageDailyMenu, canManageMealCatalog, canManageMenu } from '../../../auth/accessControl.js';
import {
  addToDailyMenu,
  deleteDailyMenuEntry,
  deleteMenuItem,
  getMealCatalog,
  getMenu,
  updateDailyMenuEntry,
  updateMenuItem,
} from '../../../api/modules/menuApi.js';
import Card from '../../../components/Card.jsx';
import Modal from '../../../components/Modal.jsx';
import Input from '../../../components/Input.jsx';
import foodPlaceholder from '../../../assets/images/food-placeholder.svg';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

const SECTIONS = {
  daily: 'daily',
  catalog: 'catalog',
};

const toCatalogItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const id = item.meal_id ?? item.id;
  return {
    ...item,
    id,
    meal_id: id,
    image_url: item.image_url ?? item.meal_photo_url ?? item.image,
    meal_type: item.category ?? item.meal_type,
    is_active: item.is_active !== false,
  };
};

export default function StaffMenuPage() {
  const { roles } = useAuth();
  const { setToast } = useToast();
  const [dailyMenu, setDailyMenu] = useState([]);
  const [mealCatalog, setMealCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(SECTIONS.daily);
  const [editingItem, setEditingItem] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [addingDailyOpen, setAddingDailyOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const canDailyCrud = canManageDailyMenu(roles);
  const canMealCrud = canManageMealCatalog(roles);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [daily, catalog] = await Promise.all([
        getMenu().catch(() => []),
        getMealCatalog().catch(() => []),
      ]);
      setDailyMenu(Array.isArray(daily) ? daily : daily?.results ?? []);
      const rawCatalog = Array.isArray(catalog) ? catalog : catalog?.results ?? [];
      setMealCatalog(rawCatalog.map(toCatalogItem));
    } finally {
      setLoading(false);
    }
  };

  const allowed = canManageMenu(roles);

  const existingDailyMealIds = useMemo(
    () => new Set(dailyMenu.map((item) => String(item.meal_id ?? item.id))),
    [dailyMenu]
  );

  const addableCatalogMeals = useMemo(
    () => mealCatalog.filter((meal) => !existingDailyMealIds.has(String(meal.meal_id ?? meal.id))),
    [mealCatalog, existingDailyMealIds]
  );

  if (!allowed) {
    return (
      <div className="min-h-screen bg-edueats-bg px-4 py-10 sm:px-6">
        <Link to="/staff/orders" className="text-edueats-text">Back</Link>
        <Card className="mt-4">
          <p className="text-center text-sm text-edueats-textMuted">You do not have permission to manage the menu.</p>
        </Card>
      </div>
    );
  }

  const toggleAvailability = (item) => {
    if (!canDailyCrud) return;
    const next = !item.available;
    setUpdatingId(item.daily_menu_id ?? item.id);
    const patchTarget = item.daily_menu_id
      ? updateDailyMenuEntry(item.daily_menu_id, { is_available: next })
      : updateMenuItem(item.meal_id ?? item.id, { is_active: next });
    patchTarget
      .then(() => {
        setDailyMenu((prev) =>
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
    if (!canMealCrud) return;
    if (!editingItem) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      setToast('Please enter a valid price', 'error');
      return;
    }
    setUpdatingId(editingItem.meal_id ?? editingItem.id);
    try {
      await updateMenuItem(editingItem.meal_id ?? editingItem.id, { price });
      setMealCatalog((prev) =>
        prev.map((m) =>
          (m.meal_id ?? m.id) === (editingItem.meal_id ?? editingItem.id) ? { ...m, price } : m
        )
      );
      setDailyMenu((prev) =>
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
    if (!deletingTarget?.id) return;
    const { type, id } = deletingTarget;
    setUpdatingId(id);
    try {
      if (type === SECTIONS.daily) {
        if (!canDailyCrud) return;
        await deleteDailyMenuEntry(id);
        setDailyMenu((prev) => prev.filter((m) => (m.daily_menu_id ?? m.id) !== id));
        setToast('Removed from Today\'s Menu', 'success');
      } else {
        if (!canMealCrud) return;
        await deleteMenuItem(id);
        setMealCatalog((prev) => prev.filter((m) => (m.meal_id ?? m.id) !== id));
        setDailyMenu((prev) => prev.filter((m) => (m.meal_id ?? m.id) !== id));
        setToast('Meal deleted from catalog', 'success');
      }
      setDeletingTarget(null);
    } catch (err) {
      setToast(err?.message ?? 'Failed to delete item', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const addSelectedMealToDailyMenu = async () => {
    if (!canDailyCrud) return;
    if (!selectedMealId) {
      setToast('Please select a meal', 'error');
      return;
    }

    setUpdatingId(selectedMealId);
    try {
      const quantity = quantityAvailable !== '' ? parseInt(quantityAvailable, 10) : null;
      await addToDailyMenu({
        meal_id: selectedMealId,
        menu_date: new Date().toISOString().split('T')[0],
        ...(quantity !== null && !isNaN(quantity) ? { quantity_available: quantity } : {}),
        is_available: true,
      });
      setToast('Meal added to Today\'s Menu', 'success');
      setAddingDailyOpen(false);
      setSelectedMealId('');
      setQuantityAvailable('');
      fetchData();
    } catch (err) {
      setToast(err?.message ?? 'Failed to add meal to daily menu', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg">
      <header className="rounded-b-card bg-edueats-primary px-4 pt-10 pb-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/staff/orders" className="text-edueats-text">Back</Link>
          <h1 className="text-xl font-semibold text-edueats-text truncate">Menu Management</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 overflow-x-auto rounded-full bg-edueats-surface p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveSection(SECTIONS.daily)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${
                activeSection === SECTIONS.daily ? 'bg-edueats-accent text-white' : 'text-edueats-textMuted'
              }`}
            >
              Today\'s Menu
            </button>
            <button
              type="button"
              onClick={() => setActiveSection(SECTIONS.catalog)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${
                activeSection === SECTIONS.catalog ? 'bg-edueats-accent text-white' : 'text-edueats-textMuted'
              }`}
            >
              Meal Catalog
            </button>
          </div>

          {activeSection === SECTIONS.catalog && canMealCrud && (
            <Link
              to="/staff/menu/add"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-edueats-accent px-3 py-2 text-sm font-medium text-white sm:w-auto"
            >
              <FiPlus aria-hidden="true" />
              Create Meal
            </Link>
          )}

          {activeSection === SECTIONS.daily && canDailyCrud && (
            <button
              type="button"
              onClick={() => setAddingDailyOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-edueats-accent px-3 py-2 text-sm font-medium text-white sm:w-auto"
            >
              <FiPlus aria-hidden="true" />
              Add to Daily Menu
            </button>
          )}
        </div>

        {activeSection === SECTIONS.daily && (
          <p className="mb-4 text-xs text-edueats-textMuted">
            Daily Menu is date-based. Entries may be auto-generated for active meals and managed per day.
          </p>
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-edueats-textMuted">Loading...</p>
        ) : activeSection === SECTIONS.daily && dailyMenu.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No menu items</p>
          </Card>
        ) : activeSection === SECTIONS.catalog && mealCatalog.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-edueats-textMuted">No meals in catalog</p>
          </Card>
        ) : activeSection === SECTIONS.daily ? (
          <div className="space-y-4">
            {dailyMenu.map((m, idx) => {
              const available = m.available !== false && m.in_stock !== false;
              const itemKey = m.daily_menu_id ?? m.meal_id ?? m.id;
              const reactKey = `${itemKey ?? 'menu-item'}-${idx}`;
              return (
                <Card key={reactKey} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-start gap-3 sm:min-w-0 sm:flex-1 sm:items-center">
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
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      available ? 'bg-edueats-success/20 text-edueats-success' : 'bg-edueats-danger/20 text-edueats-danger'
                    }`}
                  >
                    {available ? 'Available' : 'Out of Stock'}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    {canDailyCrud && (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleAvailability(m)}
                          disabled={updatingId === itemKey}
                          className={`rounded px-2 py-1 text-xs font-medium sm:text-[11px] ${
                            available ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          } disabled:opacity-50`}
                          aria-label={available ? 'Update Availability: mark out of stock' : 'Update Availability: mark available'}
                          title="Update Availability"
                        >
                          Update Availability
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTarget({ type: SECTIONS.daily, id: itemKey, name: m.name })}
                          disabled={updatingId === itemKey}
                          className="rounded p-2 hover:bg-edueats-border text-edueats-danger disabled:opacity-50"
                          aria-label="Remove from daily menu"
                          title="Remove from Daily Menu"
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {!canMealCrud && (
              <Card>
                <p className="text-xs text-edueats-textMuted">
                  You can view Meal Catalog entries, but only waitress/admin can create, edit, or delete meals.
                </p>
              </Card>
            )}
            {mealCatalog.map((m, idx) => {
              const itemKey = m.meal_id ?? m.id;
              const reactKey = `${itemKey ?? 'meal-item'}-${idx}`;
              return (
                <Card key={reactKey} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-start gap-3 sm:min-w-0 sm:flex-1 sm:items-center">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-edueats-border">
                    <img
                      src={m.image_url || m.meal_photo_url || foodPlaceholder}
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
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.is_active ? 'bg-edueats-success/20 text-edueats-success' : 'bg-edueats-danger/20 text-edueats-danger'
                    }`}
                  >
                    {m.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {canMealCrud && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        disabled={updatingId === itemKey}
                        className="rounded p-2 hover:bg-edueats-border text-edueats-text disabled:opacity-50"
                        aria-label="Edit meal"
                        title="Edit Meal"
                      >
                        <FiEdit2 aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTarget({ type: SECTIONS.catalog, id: itemKey, name: m.name })}
                        disabled={updatingId === itemKey}
                        className="rounded p-2 hover:bg-edueats-border text-edueats-danger disabled:opacity-50"
                        aria-label="Delete meal"
                        title="Delete Meal"
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {editingItem && (
        <Modal
          isOpen={Boolean(editingItem)}
          title="Edit Meal"
          onClose={() => setEditingItem(null)}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setEditingItem(null),
          }}
          primaryAction={{
            label: updatingId === (editingItem.meal_id ?? editingItem.id) ? 'Saving...' : 'Save',
            onClick: savePrice,
            disabled: updatingId === (editingItem.meal_id ?? editingItem.id),
          }}
        >
          <div className="space-y-4">
            <p className="text-sm text-edueats-textMuted">{editingItem.name}</p>
            <Input
              label="Price (Ksh)"
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </Modal>
      )}

      {deletingTarget && (
        <Modal
          isOpen={Boolean(deletingTarget)}
          title={deletingTarget.type === SECTIONS.catalog ? 'Delete Meal?' : 'Remove From Today?'}
          onClose={() => setDeletingTarget(null)}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setDeletingTarget(null),
          }}
          primaryAction={{
            label:
              updatingId === deletingTarget.id
                ? deletingTarget.type === SECTIONS.catalog
                  ? 'Deleting...'
                  : 'Removing...'
                : deletingTarget.type === SECTIONS.catalog
                  ? 'Delete Meal'
                  : 'Remove from Daily Menu',
            onClick: confirmDelete,
            disabled: updatingId === deletingTarget.id,
          }}
        >
          <p className="text-sm text-edueats-textMuted">
            {deletingTarget.type === SECTIONS.catalog
              ? 'Delete Meal removes this item from the catalog and related daily entries.'
              : 'Remove from Today removes only this daily menu entry.'}
          </p>
        </Modal>
      )}

      <Modal
        isOpen={addingDailyOpen}
        title="Add To Daily Menu"
        onClose={() => {
          setAddingDailyOpen(false);
          setSelectedMealId('');
          setQuantityAvailable('');
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setAddingDailyOpen(false);
            setSelectedMealId('');
            setQuantityAvailable('');
          },
        }}
        primaryAction={{
          label: updatingId && String(updatingId) === String(selectedMealId) ? 'Adding...' : 'Add to Daily Menu',
          onClick: addSelectedMealToDailyMenu,
          disabled: !selectedMealId || (updatingId && String(updatingId) === String(selectedMealId)),
        }}
      >
        {addableCatalogMeals.length === 0 ? (
          <p className="text-sm text-edueats-textMuted">
            No addable meals found. Daily entries may already be auto-generated for active meals.
          </p>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm text-edueats-textMuted" htmlFor="daily-meal-select">
              Meal
            </label>
            <select
              id="daily-meal-select"
              value={selectedMealId}
              onChange={(e) => setSelectedMealId(e.target.value)}
              className="w-full rounded-lg border border-edueats-border bg-white px-3 py-2 text-sm text-edueats-text"
            >
              <option value="">Select a meal</option>
              {addableCatalogMeals.map((meal) => {
                const mealId = meal.meal_id ?? meal.id;
                return (
                  <option key={mealId} value={mealId}>
                    {meal.name}
                  </option>
                );
              })}
            </select>
            <Input
              label="Quantity Available (Optional)"
              type="number"
              min="0"
              value={quantityAvailable}
              onChange={(e) => setQuantityAvailable(e.target.value)}
              placeholder="Leave blank for default"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
