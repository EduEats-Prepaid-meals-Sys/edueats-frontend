const WALLET_TOPUP_PATH = '/wallet/topup/initiate/';

export const endpoints = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
  },
  users: {
    me: '/users/me/',
  },
  menu: {
    list: '/menu/',
    item: (id) => `/menu/${id}/`,
  },
  orders: {
    create: '/orders/',
    live: '/orders/live/',
    history: '/orders/history/',
    status: (id) => `/orders/${id}/status/`,
  },
  limits: {
    set: '/limits/',
  },
  reports: {
    personal: '/reports/personal/',
    mess: '/reports/mess/',
  },
  wallet: {
    topup: WALLET_TOPUP_PATH,
  },
};

export { WALLET_TOPUP_PATH };
