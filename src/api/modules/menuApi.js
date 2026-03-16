import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

const normalizeDailyMenuItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  const meal = item.meal && typeof item.meal === 'object' ? item.meal : null;
  if (!meal) return item;

  return {
    ...meal,
    daily_menu_id: item.id,
    quantity: item.quantity,
    available: item.available ?? meal.available,
    in_stock: item.in_stock ?? item.available ?? meal.in_stock,
  };
};

const normalizeMenuList = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.results ?? [];
  return list.map(normalizeDailyMenuItem);
};

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
    return apiRequest(endpoints.menu.mealItem(id));
  }
};

export const createMenuItem = (body) =>
  apiRequest(endpoints.menu.meals, { method: 'POST', body: JSON.stringify(body) });

export const updateMenuItem = (id, body) =>
  apiRequest(endpoints.menu.mealItem(id), { method: 'PATCH', body: JSON.stringify(body) });
