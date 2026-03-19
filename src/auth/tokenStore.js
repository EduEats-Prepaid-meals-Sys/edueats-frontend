let inMemoryToken = null;
let inMemoryRefreshToken = null;

const STORAGE_KEY = 'edueats_jwt';
const REFRESH_STORAGE_KEY = 'edueats_jwt_refresh';

const hasWindow = typeof window !== 'undefined';

const readFromSession = () => {
  if (!hasWindow) return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const readRefreshFromSession = () => {
  if (!hasWindow) return null;
  try {
    return sessionStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const getToken = () => {
  if (inMemoryToken) return inMemoryToken;
  const stored = readFromSession();
  if (stored) {
    inMemoryToken = stored;
  }
  return inMemoryToken;
};

export const setToken = (token) => {
  inMemoryToken = token || null;
  if (!hasWindow) return;
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const getRefreshToken = () => {
  if (inMemoryRefreshToken) return inMemoryRefreshToken;
  const stored = readRefreshFromSession();
  if (stored) {
    inMemoryRefreshToken = stored;
  }
  return inMemoryRefreshToken;
};

export const setRefreshToken = (token) => {
  inMemoryRefreshToken = token || null;
  if (!hasWindow) return;
  try {
    if (token) {
      sessionStorage.setItem(REFRESH_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(REFRESH_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const clearToken = () => {
  setToken(null);
};

export const clearRefreshToken = () => {
  setRefreshToken(null);
};

export const clearAuthTokens = () => {
  clearToken();
  clearRefreshToken();
};
