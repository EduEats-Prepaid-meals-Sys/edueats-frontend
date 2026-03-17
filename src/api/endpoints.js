const WALLET_TOPUP_PATH = '/wallet/topup/';

export const endpoints = {
  auth: {
    studentLogin: '/users/student/login/',
    staffLogin: '/users/staff/login/',
    adminLogin: '/users/admin/login/',
    studentSignup: '/users/student/signup/',
    staffSignup: '/users/signup/',
    verifyEmail: '/users/verify-email/',
    logout: '/users/logout/',
  },
  users: {
    me: '/users/me/',
  },
  menu: {
    meals: '/menu/meals/',
    mealItem: (id) => `/menu/meals/${id}/`,
    daily: '/menu/daily/',
    dailyItem: (id) => `/menu/daily/${id}/`,
  },
  orders: {
    create: '/orders/student/create/',
    checkout: '/orders/student/checkout/',
    deleteDraft: (id) => `/orders/student/${id}/delete/`,
    history: '/orders/student/history/',
    live: '/orders/staff/all/',
    status: (id) => `/orders/staff/${id}/status/`,
  },
  wallet: {
    balance: '/wallet/balance/',
    limitsMe: '/wallet/limits/me/',
    topup: WALLET_TOPUP_PATH,
    topupHistory: '/wallet/topup/history/',
  },
  payments: {
    studentHistory: '/payments/student/history/',
    staffAll: '/payments/staff/all/',
    staffSummary: '/payments/staff/summary/',
  },
  reports: {
    studentSummary: '/reports/student/summary/',
    studentTrend: (days = 30) => `/reports/student/trend/?days=${days}`,
    staffSalesSummary: '/reports/staff/sales-summary/',
    staffPopularMeals: (limit = 10) => `/reports/staff/popular-meals/?limit=${limit}`,
  },
  utils: {
    health: '/utils/health/',
    appInfo: '/utils/app-info/',
    dashboardSummary: '/utils/dashboard-summary/',
  },
};

export { WALLET_TOPUP_PATH };
