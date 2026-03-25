const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const STAFF_ID_RE = /^[A-Za-z0-9_-]{3,30}$/;

export const normalizePhoneInput = (value = '') => {
  const raw = String(value).trim();
  if (!raw) return '';

  const keepPlus = raw.startsWith('+') ? '+' : '';
  const digits = raw.replace(/\D/g, '');
  return keepPlus ? `${keepPlus}${digits}` : digits;
};

export const isValidEmail = (value = '') => EMAIL_RE.test(String(value).trim());

export const isValidFullName = (value = '') => {
  const name = String(value).trim();
  return NAME_RE.test(name);
};

export const isValidPhoneNumber = (value = '') => {
  const normalized = normalizePhoneInput(value);
  if (!normalized) return false;

  const digitsOnly = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  return /^\d{10}$/.test(digitsOnly);
};

export const isStrongPassword = (value = '') => {
  const password = String(value);
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
};

export const isValidStaffId = (value = '') => STAFF_ID_RE.test(String(value).trim());
