import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { canUseAdminApp } from '../auth/accessControl.js';

export default function AdminShell() {
  const { roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canUseAdminApp(roles)) {
      navigate('/post-login', { replace: true });
    }
  }, [roles, navigate]);

  if (!canUseAdminApp(roles)) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}
