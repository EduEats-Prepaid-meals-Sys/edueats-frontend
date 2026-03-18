import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { canUseStudentApp, canUseStaffApp, canUseAdminApp } from '../auth/accessControl.js';
import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import StudentShell from '../layout/StudentShell.jsx';
import StaffShell from '../layout/StaffShell.jsx';
import AdminShell from '../layout/AdminShell.jsx';

import SplashPage from '../features/student/pages/SplashPage.jsx';
import RegisterPage from '../features/student/pages/RegisterPage.jsx';
import LoginPage from '../features/student/pages/LoginPage.jsx';
import VerifyEmailPage from '../features/student/pages/VerifyEmailPage.jsx';
import VerifyCodePage from '../features/student/pages/VerifyCodePage.jsx';
import ForgotPasswordPage from '../features/student/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/student/pages/ResetPasswordPage.jsx';
import StudentHomePage from '../features/student/pages/StudentHomePage.jsx';
import MenuPage from '../features/student/pages/MenuPage.jsx';
import MealDetailsPage from '../features/student/pages/MealDetailsPage.jsx';
import CartPage from '../features/student/pages/CartPage.jsx';
import WalletPage from '../features/student/pages/WalletPage.jsx';
import LimitsPage from '../features/student/pages/LimitsPage.jsx';
import TransactionsPage from '../features/student/pages/TransactionsPage.jsx';
import ReportsPage from '../features/student/pages/ReportsPage.jsx';
import SettingsPage from '../features/student/pages/SettingsPage.jsx';

import StaffLoginPage from '../features/staff/pages/StaffLoginPage.jsx';
import StaffRegisterPage from '../features/staff/pages/StaffRegisterPage.jsx';
import StaffOrdersPage from '../features/staff/pages/StaffOrdersPage.jsx';
import StaffPopularPage from '../features/staff/pages/StaffPopularPage.jsx';
import StaffMenuPage from '../features/staff/pages/StaffMenuPage.jsx';
import AddMealPage from '../features/staff/pages/AddMealPage.jsx';

import AdminAnalyticsPage from '../features/admin/pages/AdminAnalyticsPage.jsx';
import AdminReportsPage from '../features/admin/pages/AdminReportsPage.jsx';
import AdminMenuPage from '../features/admin/pages/AdminMenuPage.jsx';

function RedirectByRole() {
  const { roles } = useAuth();
  if (canUseStudentApp(roles)) return <Navigate to="/student/home" replace />;
  if (canUseStaffApp(roles)) return <Navigate to="/staff/orders" replace />;
  if (canUseAdminApp(roles)) return <Navigate to="/admin/analytics" replace />;
  return <Navigate to="/student/home" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/staff/login" element={<StaffLoginPage />} />
      <Route path="/staff/register" element={<StaffRegisterPage />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<StudentHomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:id" element={<MealDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="limits" element={<LimitsPage />} />
        <Route path="orders" element={<TransactionsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<SettingsPage />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<StaffOrdersPage />} />
        <Route path="popular" element={<StaffPopularPage />} />
        <Route path="menu" element={<StaffMenuPage />} />
        <Route path="menu/add" element={<AddMealPage />} />
        <Route path="profile" element={<SettingsPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="menu" element={<AdminMenuPage />} />
      </Route>

      <Route path="/post-login" element={<RedirectByRole />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
