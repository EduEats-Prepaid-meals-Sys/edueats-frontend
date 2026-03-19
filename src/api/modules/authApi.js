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

export const registerStaff = async (body = {}) => {
  const payload = cleanPayload({
    email: body.email,
    password: body.password,
    full_name: body.full_name ?? body.name,
    mobile_number: body.mobile_number ?? body.contact ?? body.phone_number,
    role: body.role,   // 'caterer' or 'waitress'
    staff_id: body.staff_id,
  });
  return apiRequest(endpoints.auth.staffSignup, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const registerUnified = async (body = {}) => {
  const payload = cleanPayload({
    email: body.email,
    password: body.password,
    full_name: body.full_name ?? body.name,
    mobile_number: body.mobile_number ?? body.contact ?? body.phone_number,
    role: body.role,
    staff_id: body.staff_id,
  });
  return apiRequest(endpoints.auth.signup, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

export const updateMe = async (body) => {
  try {
    return await apiRequest(endpoints.users.me, { method: 'PATCH', body: JSON.stringify(body) });
  } catch (err) {
    if (err?.status !== 405 && err?.status !== 404) throw err;
    return apiRequest(endpoints.users.me, { method: 'PUT', body: JSON.stringify(body) });
  }
};

export const updateMyDetails = async (body, method = 'PATCH') => {
  const normalizedMethod = method === 'PUT' ? 'PUT' : 'PATCH';
  return apiRequest(endpoints.users.updateDetails, {
    method: normalizedMethod,
    body: JSON.stringify(body),
  });
};

export const verifyEmailCode = (body) =>
  apiRequest(endpoints.auth.verifyEmail, { method: 'POST', body: JSON.stringify(body) });

export const resendVerificationCode = (body) =>
  apiRequest(endpoints.auth.resendVerification, { method: 'POST', body: JSON.stringify(body) });

export const requestPasswordReset = (body) =>
  apiRequest(endpoints.auth.forgotPassword, { method: 'POST', body: JSON.stringify(body) });

export const resetPasswordWithCode = (body) =>
  apiRequest(endpoints.auth.resetPassword, { method: 'POST', body: JSON.stringify(body) });

export const adminDeleteUser = (userId) =>
  apiRequest(endpoints.users.adminDelete(userId), { method: 'DELETE' });

export const logout = (refreshToken) => {
  if (!refreshToken) return Promise.resolve({ ok: true });
  return apiRequest(endpoints.auth.logout, { method: 'POST', body: JSON.stringify({ refresh: refreshToken }) });
};
