import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const toAbsoluteAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return origin ? `${origin}${value}` : value;
  }
  return value;
};

const normalizeDailyMenuItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  const meal = item.meal && typeof item.meal === 'object' ? item.meal : item;

  const availableRaw = item.is_available ?? item.available ?? meal.is_active ?? meal.is_available;
  const available = availableRaw === undefined ? true : Boolean(availableRaw);

  const stockStatus = item.stock_status ?? meal.stock_status;
  const inStockRaw = item.in_stock ?? meal.in_stock;
  const inStock = typeof inStockRaw === 'boolean'
    ? inStockRaw
    : stockStatus
      ? stockStatus !== 'out_of_stock'
      : true;

  // daily_menu_id is the key used for PATCH/DELETE on the daily menu entry
  // meal_id is the primary key on the Meal catalog
  const primaryId = meal.meal_id ?? meal.id;

  return {
    ...meal,
    id: primaryId,
    meal_id: primaryId,
    daily_menu_id: item.daily_menu_id ?? item.id,
    quantity_available: item.quantity_available,
    meal_type: meal.category ?? meal.meal_type,
    image_url: toAbsoluteAssetUrl(
      meal.meal_photo_url ?? meal.image_url ?? meal.image ?? item.image_url ?? item.image
    ),
    imageUrl: toAbsoluteAssetUrl(
      meal.meal_photo_url ?? meal.image_url ?? meal.image ?? item.image_url ?? item.image
    ),
    available,
    in_stock: inStock,
  };
};

const normalizeMenuList = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.results ?? [];
  return list.map(normalizeDailyMenuItem);
};

const isFormDataBody = (value) =>
  typeof FormData !== 'undefined' && value instanceof FormData;

const toRequestBody = (body) => (isFormDataBody(body) ? body : JSON.stringify(body));

export const getMenu = async () => {
  try {
    const daily = await apiRequest(endpoints.menu.daily);
    return normalizeMenuList(daily);
  } catch {
    const meals = await apiRequest(endpoints.menu.meals);
    return normalizeMenuList(meals);
  }
};

export const getMenuItem = async (id) => {
  try {
    const dailyItem = await apiRequest(endpoints.menu.dailyItem(id));
    return normalizeDailyMenuItem(dailyItem);
  } catch {
    const mealItem = await apiRequest(endpoints.menu.mealItem(id));
    return normalizeDailyMenuItem(mealItem);
  }
};

export const getMealCatalog = async () => {
  const response = await apiRequest(endpoints.menu.meals);
  return Array.isArray(response) ? response : response?.results ?? [];
};

// Create a meal in the catalog (POST /api/menu/meals/)
export const createMealCatalog = (body) =>
  apiRequest(endpoints.menu.meals, { method: 'POST', body: toRequestBody(body) });

// Add an existing meal to today's daily menu (POST /api/menu/daily/)
export const addToDailyMenu = (body) =>
  apiRequest(endpoints.menu.daily, { method: 'POST', body: toRequestBody(body) });

// Kept for backward compat — creates catalog entry only
export const createMenuItem = createMealCatalog;

// Update a meal in the catalog
export const updateMenuItem = (meal_id, body) =>
  apiRequest(endpoints.menu.mealItem(meal_id), { method: 'PATCH', body: toRequestBody(body) });

// Update a daily menu entry (availability / quantity)
export const updateDailyMenuEntry = (daily_menu_id, body) =>
  apiRequest(endpoints.menu.dailyItem(daily_menu_id), { method: 'PATCH', body: toRequestBody(body) });

// Delete a meal from the catalog
export const deleteMenuItem = (meal_id) =>
  apiRequest(endpoints.menu.mealItem(meal_id), { method: 'DELETE' });

// Remove a meal from today's daily menu
export const deleteDailyMenuEntry = (daily_menu_id) =>
  apiRequest(endpoints.menu.dailyItem(daily_menu_id), { method: 'DELETE' });
