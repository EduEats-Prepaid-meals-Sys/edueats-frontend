import { apiRequest } from '../apiClient.js';
import { endpoints } from '../endpoints.js';

const cleanPayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const normalizeRoles = (payload) => {
  const rolesFromArray = Array.isArray(payload?.roles) ? payload.roles : null;
  if (rolesFromArray && rolesFromArray.length > 0) return rolesFromArray;

  const role = payload?.role ?? payload?.user?.role;
  if (role) return [role];

  return [];
};

export const register = async (body = {}) => {
  const contact = body.contact ?? body.phone_number ?? body.phone;

  const candidatePayloads = [
    cleanPayload({
      email: body.email,
      password: body.password,
      full_name: body.full_name ?? body.name,
      mobile_number: contact,
    }),
    cleanPayload({
      email: body.email,
      password: body.password,
      full_name: body.full_name ?? body.name,
      phone_number: contact,
    }),
  ];

  let lastError = null;
  for (const payload of candidatePayloads) {
    try {
      return await apiRequest(endpoints.auth.studentSignup, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      lastError = err;
      if (err?.status !== 400) throw err;
    }
  }

  throw lastError;
};

export const login = async (body = {}) => {
  const isStaffLogin = Boolean(body?.staff_id);
  const isAdminLogin = body?.role === 'admin' || body?.is_admin === true;

  const endpoint = isAdminLogin
    ? endpoints.auth.adminLogin
    : isStaffLogin
      ? endpoints.auth.staffLogin
      : endpoints.auth.studentLogin;

  const candidatePayloads = isStaffLogin
    ? [cleanPayload({ staff_id: body.staff_id, password: body.password })]
    : isAdminLogin
      ? [cleanPayload({ email: body.email, password: body.password })]
      : [
          cleanPayload({ email: body.email, password: body.password }),
          cleanPayload({
            email_or_reg_number: body.email_or_reg_number ?? body.email,
            password: body.password,
          }),
        ];

  let response = null;
  let lastError = null;
  for (const payload of candidatePayloads) {
    try {
      response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      break;
    } catch (err) {
      lastError = err;
      if (err?.status !== 400) throw err;
    }
  }

  if (!response) throw lastError;

  return {
    ...response,
    roles: normalizeRoles(response),
  };
};

export const getMe = async () => {
  const response = await apiRequest(endpoints.users.me);
  return {
    ...response,
    user: response?.user ?? response,
    roles: normalizeRoles(response),
  };
};

export const updateMe = (body) =>
  apiRequest(endpoints.users.me, { method: 'PUT', body: JSON.stringify(body) });

export const verifyEmailCode = (body) =>
  apiRequest(endpoints.auth.verifyEmail, { method: 'POST', body: JSON.stringify(body) });

export const logout = () => apiRequest(endpoints.auth.logout, { method: 'POST' });
