import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { canUseStudentApp } from '../auth/accessControl.js';
import BottomNav from './BottomNav.jsx';
import { FiHome, FiGrid, FiShoppingBag, FiUser } from 'react-icons/fi';

const STUDENT_NAV = [
  { to: '/student/home', label: 'Home', icon: <FiHome /> },
  { to: '/student/menu', label: 'Menu', icon: <FiGrid /> },
  { to: '/student/orders', label: 'Orders', icon: <FiShoppingBag /> },
  { to: '/student/profile', label: 'Profile', icon: <FiUser /> },
];

export default function StudentShell() {
  const { roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canUseStudentApp(roles)) navigate('/staff/orders', { replace: true });
  }, [roles, navigate]);

  if (!canUseStudentApp(roles)) return null;

  return (
    <div className="min-h-screen flex flex-col pb-14">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav items={STUDENT_NAV} />
    </div>
  );
}
