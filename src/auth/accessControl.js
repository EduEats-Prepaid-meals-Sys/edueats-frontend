const ROLE_KEYS = {
  student: 'student',
  staff: 'staff',
  admin: 'admin',
};

const ROLE_ALIASES = {
  [ROLE_KEYS.student]: ['student'],
  [ROLE_KEYS.staff]: ['staff', 'waitress'],
  [ROLE_KEYS.admin]: ['admin', 'caterer'],
};

const CAPABILITIES = {
  [ROLE_KEYS.student]: ['student:home', 'student:orders', 'student:wallet'],
  [ROLE_KEYS.staff]: ['staff:orders', 'staff:analytics', 'staff:menu'],
  [ROLE_KEYS.admin]: ['admin:analytics', 'admin:reports', 'admin:menu'],
};

const CAPABILITY_MANAGE_MENU = 'staff:menu';

const normalizeRoles = (rawRoles = []) => {
  const input = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  const lower = input
    .filter(Boolean)
    .map((r) => String(r).toLowerCase().trim());

  const resolved = new Set();

  Object.entries(ROLE_ALIASES).forEach(([key, aliases]) => {
    if (aliases.some((alias) => lower.includes(alias))) {
      resolved.add(key);
    }
  });

  return Array.from(resolved);
};

export const getCapabilitiesForRoles = (rawRoles) => {
  const roles = normalizeRoles(rawRoles);
  const caps = new Set();

  roles.forEach((role) => {
    (CAPABILITIES[role] || []).forEach((cap) => caps.add(cap));
  });

  return Array.from(caps);
};

export const hasCapability = (rawRoles, capability) =>
  getCapabilitiesForRoles(rawRoles).includes(capability);

export const canUseStudentApp = (rawRoles) =>
  hasCapability(rawRoles, 'student:home');

export const canUseStaffApp = (rawRoles) =>
  hasCapability(rawRoles, 'staff:orders');

export const canUseAdminApp = (rawRoles) =>
  hasCapability(rawRoles, 'admin:analytics');

export const canManageMenu = (rawRoles) =>
  hasCapability(rawRoles, CAPABILITY_MANAGE_MENU) ||
  hasCapability(rawRoles, 'admin:menu');

export const accessControl = {
  ROLE_KEYS,
  getCapabilitiesForRoles,
  hasCapability,
  canUseStudentApp,
  canUseStaffApp,
  canUseAdminApp,
  canManageMenu,
};
