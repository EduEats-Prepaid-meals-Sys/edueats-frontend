import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import { useToast } from '../../../App.jsx';
import { getMyLimits, setLimits } from '../../../api/modules/limitsApi.js';
import { FiEdit, FiMoon, FiGlobe, FiLock, FiBell, FiChevronRight, FiLogOut, FiDollarSign } from 'react-icons/fi';

const isStaff = (path) => path.startsWith('/staff');
const isAdmin = (path) => path.startsWith('/admin');
const PREF_KEYS = {
  darkMode: 'edueats.pref.darkMode',
  language: 'edueats.pref.language',
  alerts: 'edueats.pref.alerts',
};
const LANGUAGE_OPTIONS = ['English', 'Swahili'];

const readBoolPref = (key, fallback = false) => {
  try {
    const value = window.localStorage.getItem(key);
    if (value == null) return fallback;
    return value === 'true';
  } catch {
    return fallback;
  }
};

const readStringPref = (key, fallback = '') => {
  try {
    const value = window.localStorage.getItem(key);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { setToast } = useToast();
  const location = useLocation();
  const name = user?.name ?? user?.full_name ?? user?.username ?? 'User';
  const isStudent = !isStaff(location.pathname) && !isAdmin(location.pathname);
  const roleLabel = isAdmin(location.pathname) ? 'Admin' : isStaff(location.pathname) ? 'Staff' : 'Student';
  const backTo = isStaff(location.pathname) ? '/staff/orders' : isAdmin(location.pathname) ? '/admin/analytics' : '/student/home';

  const [dailyLimit, setDailyLimit] = useState('');
  const [initialDailyLimit, setInitialDailyLimit] = useState('');
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const savedDark = readBoolPref(PREF_KEYS.darkMode, false);
    const savedAlerts = readBoolPref(PREF_KEYS.alerts, false);
    const savedLanguage = readStringPref(PREF_KEYS.language, 'English');
    setDarkModeEnabled(savedDark);
    setAlertsEnabled(savedAlerts);
    setLanguage(LANGUAGE_OPTIONS.includes(savedLanguage) ? savedLanguage : 'English');
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEYS.darkMode, String(darkModeEnabled));
      document.documentElement.style.colorScheme = darkModeEnabled ? 'dark' : 'light';
    } catch {
      // Ignore storage/DOM failures (e.g. restricted browser mode)
    }
  }, [darkModeEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEYS.alerts, String(alertsEnabled));
    } catch {
      // Ignore storage failures.
    }
  }, [alertsEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREF_KEYS.language, language);
    } catch {
      // Ignore storage failures.
    }
  }, [language]);

  useEffect(() => {
    if (!isStudent) return;

    getMyLimits()
      .then((data) => {
        const limit = data?.daily_limit ?? data?.dailyLimit ?? '';
        const normalized = limit === null || limit === undefined ? '' : String(limit);
        setDailyLimit(normalized);
        setInitialDailyLimit(normalized);
      })
      .catch(() => {
        setDailyLimit('');
        setInitialDailyLimit('');
      });
  }, [isStudent]);

  const handleSaveLimit = async () => {
    const value = Number(dailyLimit);
    if (!Number.isFinite(value) || value <= 0) {
      setToast('Enter a valid daily limit amount.', 'error');
      return;
    }

    setLimitLoading(true);
    try {
      await setLimits({ daily_limit: value });
      setInitialDailyLimit(String(value));
      setIsEditingLimit(false);
      setToast('Daily limit updated.', 'success');
    } catch (err) {
      setToast(err?.message ?? 'Failed to update daily limit.', 'error');
    } finally {
      setLimitLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    setDarkModeEnabled((prev) => {
      const next = !prev;
      setToast(`Dark mode ${next ? 'enabled' : 'disabled'} (saved on this device).`, 'success');
      return next;
    });
  };

  const handleToggleAlerts = () => {
    setAlertsEnabled((prev) => {
      const next = !prev;
      setToast(`Alerts ${next ? 'enabled' : 'disabled'} (frontend-only setting).`, 'success');
      return next;
    });
  };

  const handleCycleLanguage = () => {
    setLanguage((prev) => {
      const currentIndex = LANGUAGE_OPTIONS.indexOf(prev);
      const next = LANGUAGE_OPTIONS[(currentIndex + 1) % LANGUAGE_OPTIONS.length];
      setToast(`Language set to ${next} (saved on this device).`, 'success');
      return next;
    });
  };

  const handlePrivacyClick = () => {
    setToast('Privacy and Security links are informational in this frontend-only version.', 'success');
  };

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      {/* Header with Avatar */}
      <div className="bg-edueats-primary px-6 py-10 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-edueats-accent to-edueats-primary shadow-md" />
        </div>
        <p className="text-lg font-semibold text-edueats-text">{name}</p>
        <p className="text-sm text-edueats-textMuted">{roleLabel}</p>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Account Section */}
        <Card className="mb-4 px-0 py-0">
          <p className="mb-3 border-b border-edueats-border px-4 py-2 text-xs font-semibold uppercase text-edueats-textMuted">
            Account
          </p>
          <Link
            to={isStaff(location.pathname) ? '/staff/profile' : '/student/profile'}
            className="flex items-center justify-between px-4 py-3 text-edueats-text hover:bg-edueats-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiEdit className="text-edueats-textMuted" />
              <span>Edit profile</span>
            </div>
            <FiChevronRight className="text-edueats-textMuted" />
          </Link>
        </Card>

        {/* Personalization Section */}
        <Card className="mb-4 px-0 py-0">
          <p className="mb-3 border-b border-edueats-border px-4 py-2 text-xs font-semibold uppercase text-edueats-textMuted">
            Personalization
          </p>

          {/* Dark Mode */}
          <div className="flex items-center justify-between border-b border-edueats-border px-4 py-3">
            <div className="flex items-center gap-3">
              <FiMoon className="text-edueats-textMuted" />
              <span className="text-edueats-text">Dark Mode</span>
            </div>
            <button
              type="button"
              onClick={handleToggleDarkMode}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                darkModeEnabled ? 'bg-edueats-accent' : 'bg-edueats-border'
              }`}
              aria-label="Toggle dark mode"
              aria-pressed={darkModeEnabled}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  darkModeEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <button
            type="button"
            onClick={handleCycleLanguage}
            className="flex w-full items-center justify-between border-b border-edueats-border px-4 py-3 text-left hover:bg-edueats-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiGlobe className="text-edueats-textMuted" />
              <span className="text-edueats-text">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-edueats-textMuted">{language}</span>
              <FiChevronRight className="text-edueats-textMuted" />
            </div>
          </button>

          {/* Privacy and Security */}
          <button
            type="button"
            onClick={handlePrivacyClick}
            className="flex w-full items-center justify-between border-b border-edueats-border px-4 py-3 text-left hover:bg-edueats-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiLock className="text-edueats-textMuted" />
              <span className="text-edueats-text">Privacy and Security</span>
            </div>
            <FiChevronRight className="text-edueats-textMuted" />
          </button>

          {/* Alerts Notification */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <FiBell className="text-edueats-textMuted" />
              <span className="text-edueats-text">Alerts Notification</span>
            </div>
            <button
              type="button"
              onClick={handleToggleAlerts}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                alertsEnabled ? 'bg-edueats-accent' : 'bg-edueats-border'
              }`}
              aria-label="Toggle alerts"
              aria-pressed={alertsEnabled}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  alertsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Daily Spending Limit Section (Students Only) */}
        {isStudent && (
          <Card className="mb-4 px-0 py-0">
            <p className="mb-3 border-b border-edueats-border px-4 py-3 text-xs font-semibold uppercase text-edueats-textMuted">
              Daily Spending
            </p>
            <div className="px-4 py-4">
              {!isEditingLimit ? (
                <div
                  className="flex items-center justify-between rounded-lg bg-edueats-surface p-3 cursor-pointer hover:bg-edueats-border transition-colors"
                  onClick={() => setIsEditingLimit(true)}
                >
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-edueats-accent" />
                    <div>
                      <p className="text-xs text-edueats-textMuted">Daily Limit (Ksh)</p>
                      <p className="text-base font-semibold text-edueats-text">
                        {initialDailyLimit || '—'}
                      </p>
                    </div>
                  </div>
                  <FiEdit className="text-edueats-textMuted" />
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Daily Spending Limit (Ksh)"
                    type="number"
                    min="1"
                    step="1"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="Enter daily limit"
                    disabled={limitLoading}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveLimit}
                      disabled={limitLoading}
                      className="flex-1"
                    >
                      {limitLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDailyLimit(initialDailyLimit);
                        setIsEditingLimit(false);
                      }}
                      disabled={limitLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Log Out Button */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-edueats-danger px-4 py-3 font-semibold text-white hover:bg-red-600 transition-colors"
        >
          <FiLogOut />
          Log out
        </button>
      </div>
    </div>
  );
}
