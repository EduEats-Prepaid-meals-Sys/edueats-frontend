import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { canUseStaffApp } from '../auth/accessControl.js';
import BottomNav from './BottomNav.jsx';
import { FiList, FiBarChart2, FiGrid, FiUser } from 'react-icons/fi';

const STAFF_NAV = [
  { to: '/staff/orders', label: 'Orders', icon: <FiList /> },
  { to: '/staff/popular', label: 'Popular', icon: <FiBarChart2 /> },
  { to: '/staff/menu', label: 'Menu', icon: <FiGrid /> },
  { to: '/staff/profile', label: 'Profile', icon: <FiUser /> },
];

export default function StaffShell() {
  const { roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canUseStaffApp(roles)) navigate('/student/home', { replace: true });
  }, [roles, navigate]);

  if (!canUseStaffApp(roles)) return null;

  return (
    <div className="min-h-screen flex flex-col pb-14">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav items={STAFF_NAV} />
    </div>
  );
}
