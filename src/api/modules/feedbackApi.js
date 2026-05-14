import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

const COMMENTS_FALLBACK_PATHS = ['/comments/', '/comment/'];
const RATINGS_FALLBACK_PATHS = ['/ratings/', '/rating/', '/ratings/ratings/'];

const normalizeList = (payload) => (Array.isArray(payload) ? payload : payload?.results ?? []);

const withMealPath = (path, mealId) => {
  if (!mealId) return path;
  return typeof path === 'function' ? path(mealId) : path;
};

const withMealFilter = (path, mealId) => {
  if (!mealId) return path;
  return `${path}${path.includes('?') ? '&' : '?'}meal_id=${encodeURIComponent(mealId)}`;
};

const requestWithFallback = async (paths, options = {}, retryableStatuses = [404]) => {
  let lastError = null;
  for (const path of paths) {
    try {
      return await apiRequest(path, options);
    } catch (err) {
      lastError = err;
      if (err?.status && !retryableStatuses.includes(err.status)) throw err;
    }
  }
  throw (
    lastError ??
    new Error(`Failed to complete request. Tried: ${paths.filter(Boolean).join(', ')}`)
  );
};

const postWithPayloadFallback = async (paths, payloadCandidates) => {
  let lastError = null;
  const retryableStatuses = [400, 404, 405, 422];

  for (const body of payloadCandidates) {
    try {
      return await requestWithFallback(paths, {
        method: 'POST',
        body: JSON.stringify(body),
      }, [404, 405]);
    } catch (err) {
      lastError = err;
      if (err?.status && !retryableStatuses.includes(err.status)) {
        throw err;
      }
    }
  }

  throw (lastError ?? new Error('Failed to submit.'));
};

export const getComments = async ({ mealId } = {}) => {
  const paths = mealId
    ? [withMealPath(endpoints.comments.byMeal, mealId)]
    : [endpoints.comments.list, ...COMMENTS_FALLBACK_PATHS];
  const payload = await requestWithFallback(paths);
  return normalizeList(payload);
};

export const createComment = async ({ mealId, comment, rating = null }) => {
  const text = String(comment ?? '').trim();
  if (!text) throw new Error('Comment is required.');

  const payloadCandidates = [
    { meal_id: mealId ? Number(mealId) : undefined, comment: text, rating },
    { meal: mealId ? Number(mealId) : undefined, comment: text, rating },
    { meal_id: mealId ? Number(mealId) : undefined, content: text, rating },
    { meal: mealId ? Number(mealId) : undefined, content: text, rating },
    { meal_id: mealId ? Number(mealId) : undefined, text, rating },
    { meal: mealId ? Number(mealId) : undefined, text, rating },
  ].map((payload) =>
    Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null))
  );

  const paths = mealId ? [endpoints.comments.byMealCreate(mealId)] : [endpoints.comments.list, ...COMMENTS_FALLBACK_PATHS];
  return postWithPayloadFallback(paths, payloadCandidates);
};

export const getRatings = async ({ mealId } = {}) => {
  const paths = [
    withMealFilter(endpoints.ratings.list, mealId),
    ...RATINGS_FALLBACK_PATHS.map((path) => withMealFilter(path, mealId)),
  ];
  const payload = await requestWithFallback(paths);
  return normalizeList(payload);
};

export const createRating = async ({ mealId, rating }) => {
  const normalizedRating = Number(rating);
  if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  const payloadCandidates = [
    { meal_id: mealId ? Number(mealId) : undefined, rating: normalizedRating },
    { meal: mealId ? Number(mealId) : undefined, rating: normalizedRating },
    { meal_id: mealId ? Number(mealId) : undefined, score: normalizedRating },
    { meal: mealId ? Number(mealId) : undefined, score: normalizedRating },
  ].map((payload) =>
    Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null))
  );

  const paths = [endpoints.ratings.list, ...RATINGS_FALLBACK_PATHS];
  return postWithPayloadFallback(paths, payloadCandidates);
};
