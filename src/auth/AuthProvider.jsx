import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout as logoutRequest } from '../api/modules/authApi.js';
import { setUnauthorizedHandler, setMockUserState, getMockUserForRole } from '../api/apiClient.js';
import { clearToken, getToken, setToken } from './tokenStore.js';

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true';
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsInitializing(false);
      return;
    }
    getMe()
      .then((data) => {
        setUser(data?.user ?? data ?? {});
        setRoles(data?.roles ?? data?.user?.roles ?? []);
      })
      .catch(() => {
        clearToken();
        setUser(null);
        setRoles([]);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setRoles([]);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const login = useCallback(({ token, user: nextUser, roles: nextRoles }) => {
    setToken(token);
    setUser(nextUser ?? {});
    setRoles(Array.isArray(nextRoles) ? nextRoles : []);
  }, []);

  const logout = useCallback(() => {
    logoutRequest().catch(() => {});
    clearToken();
    setUser(null);
    setRoles([]);
    navigate('/login', { replace: true });
  }, [navigate]);

  const devLogin = useCallback(
    (role) => {
      if (!IS_MOCK) return;
      const token = `mock_${role}`;
      const nextUser = getMockUserForRole(role);
      const nextRoles = role === 'student' ? ['student'] : role === 'staff' ? ['staff'] : ['admin'];
      setMockUserState({ balance: 800, spentToday: 200, dailyLimit: 500 });
      setToken(token);
      setUser(nextUser);
      setRoles(nextRoles);
      navigate('/post-login');
    },
    [navigate]
  );

  const refreshUser = useCallback(() => {
    const token = getToken();
    if (!token) return;
    getMe()
      .then((data) => {
        setUser(data?.user ?? data ?? {});
        setRoles(data?.roles ?? data?.user?.roles ?? []);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => {
    const base = {
      user,
      roles,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      refreshUser,
    };
    if (IS_MOCK) base.devLogin = devLogin;
    return base;
  }, [user, roles, isInitializing, login, logout, refreshUser, devLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
