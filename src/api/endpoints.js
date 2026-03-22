const WALLET_TOPUP_PATH = '/wallet/topup/';

export const endpoints = {
  auth: {
    signup: '/users/signup/',
    studentLogin: '/users/student/login/',
    staffLogin: '/users/staff/login/',
    adminLogin: '/users/admin/login/',
    studentSignup: '/users/student/signup/',
    staffSignup: '/users/signup/',
    verifyEmail: '/users/verify-email/',
    resendVerification: '/users/resend-verification/',
    forgotPassword: '/users/forgot-password/',
    resetPassword: '/users/reset-password/',
    logout: '/users/logout/',
  },
  users: {
    me: '/users/me/',
    updateDetails: '/users/update-details/',
    adminDelete: (id) => `/users/admin/users/${id}/delete/`,
  },
  menu: {
    meals: '/menu/meals/',
    mealItem: (id) => `/menu/meals/${id}/`,
    daily: '/menu/daily/',
    dailyItem: (id) => `/menu/daily/${id}/`,
  },
  orders: {
    create: '/orders/student/create/',
    cart: '/orders/student/cart/',
    checkout: '/orders/student/checkout/',
    deleteDraft: (id) => `/orders/student/${id}/delete/`,
    history: '/orders/student/history/',
    live: '/orders/staff/all/',
    today: '/orders/staff/today/',
    status: (id) => `/orders/staff/${id}/status/`,
  },
  wallet: {
    balance: '/wallet/balance/',
    limitsMe: '/wallet/limits/me/',
    topup: WALLET_TOPUP_PATH,
    topupHistory: '/wallet/topup/history/',
    staffTopups: '/wallet/staff/topups/',
    staffTopupAcknowledge: (id) => `/wallet/staff/topups/${id}/acknowledge/`,
    studentTopupReceipt: (id) => `/wallet/student/receipt/${id}/`,
  },
  payments: {
    studentHistory: '/payments/student/history/',
    studentReceipt: (id) => `/payments/student/receipt/${id}/`,
    staffReceipt: (id) => `/payments/staff/receipt/${id}/`,
    staffAll: '/payments/staff/all/',
    staffSummary: '/payments/staff/summary/',
  },
  reports: {
    studentSummary: '/reports/student/summary/',
    studentTrend: (days = 30) => `/reports/student/trend/?days=${days}`,
    staffSalesSummary: '/reports/staff/sales-summary/',
    staffPopularMeals: '/reports/staff/popular-meals/',
  },
  utils: {
    health: '/utils/health/',
    appInfo: '/utils/app-info/',
    dashboardSummary: '/utils/dashboard-summary/',
  },
};

export { WALLET_TOPUP_PATH };
