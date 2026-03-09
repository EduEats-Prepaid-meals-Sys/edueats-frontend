let inMemoryToken = null;

const STORAGE_KEY = 'edueats_jwt';

const hasWindow = typeof window !== 'undefined';

const readFromSession = () => {
  if (!hasWindow) return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
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

export const clearToken = () => {
  setToken(null);
};
