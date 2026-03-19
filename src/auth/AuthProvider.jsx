import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, logout as logoutRequest } from '../api/modules/authApi.js';
import { setUnauthorizedHandler } from '../api/apiClient.js';
import { clearAuthTokens, getRefreshToken, getToken, setRefreshToken, setToken } from './tokenStore.js';

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
        clearAuthTokens();
        setUser(null);
        setRoles([]);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthTokens();
      setUser(null);
      setRoles([]);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  const login = useCallback(({ token, refreshToken, user: nextUser, roles: nextRoles }) => {
    setToken(token);
    if (refreshToken) setRefreshToken(refreshToken);
    setUser(nextUser ?? {});
    setRoles(Array.isArray(nextRoles) ? nextRoles : []);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = getRefreshToken();
    logoutRequest(refreshToken).catch(() => {});
    clearAuthTokens();
    setUser(null);
    setRoles([]);
    navigate('/login', { replace: true });
  }, [navigate]);

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
    return base;
  }, [user, roles, isInitializing, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
