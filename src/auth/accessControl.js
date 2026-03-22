export const ROLE_KEYS = {
  student: 'student',
  caterer: 'caterer',
  waitress: 'waitress',
  admin: 'admin',
};

const ROLE_ALIASES = {
  [ROLE_KEYS.student]: ['student'],
  [ROLE_KEYS.caterer]: ['caterer'],
  [ROLE_KEYS.waitress]: ['waitress', 'staff'],
  [ROLE_KEYS.admin]: ['admin'],
};

const CAPABILITIES = {
  [ROLE_KEYS.student]: ['student:home', 'student:orders', 'student:wallet', 'reports:student'],
  [ROLE_KEYS.caterer]: [
    'staff:reports',
  ],
  [ROLE_KEYS.waitress]: [
    'staff:orders',
    'staff:menu',
    'wallet:staff_topups:view',
    'wallet:staff_topups:ack',
  ],
  [ROLE_KEYS.admin]: [
    'admin:analytics',
    'admin:reports',
    'admin:menu',
    'staff:orders',
    'staff:menu',
    'staff:reports',
    'wallet:staff_topups:view',
    'wallet:staff_topups:ack',
  ],
};

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
  hasCapability(rawRoles, 'staff:orders') ||
  hasCapability(rawRoles, 'staff:menu') ||
  hasCapability(rawRoles, 'wallet:staff_topups:view') ||
  hasCapability(rawRoles, 'staff:reports');

export const canUseAdminApp = (rawRoles) =>
  hasCapability(rawRoles, 'admin:analytics');

export const canManageMenu = (rawRoles) =>
  hasCapability(rawRoles, 'staff:menu') || hasCapability(rawRoles, 'admin:menu');

export const canSeeStaffTopups = (rawRoles) =>
  hasCapability(rawRoles, 'wallet:staff_topups:view');

export const canSeeStaffReports = (rawRoles) =>
  hasCapability(rawRoles, 'staff:reports');

export const accessControl = {
  ROLE_KEYS,
  getCapabilitiesForRoles,
  hasCapability,
  canUseStudentApp,
  canUseStaffApp,
  canUseAdminApp,
  canManageMenu,
  canSeeStaffTopups,
  canSeeStaffReports,
};
