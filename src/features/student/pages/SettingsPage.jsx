import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthProvider.jsx';
import Button from '../../../components/Button.jsx';
import Card from '../../../components/Card.jsx';
import Input from '../../../components/Input.jsx';
import Modal from '../../../components/Modal.jsx';
import { useToast } from '../../../App.jsx';
import { getMyLimits, setLimits } from '../../../api/modules/limitsApi.js';
import { updateMe, updateMyDetails } from '../../../api/modules/authApi.js';
import { FiEdit, FiMoon, FiGlobe, FiLock, FiBell, FiChevronRight, FiLogOut, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

const isStaff = (path) => path.startsWith('/staff');
const isAdmin = (path) => path.startsWith('/admin');
const PREF_KEYS = {
  darkMode: 'edueats.pref.darkMode',
  language: 'edueats.pref.language',
  alerts: 'edueats.pref.alerts',
};
const LANGUAGE_OPTIONS = ['English', 'Swahili'];
const COPY = {
  English: {
    settings: 'Settings',
    account: 'Account',
    editProfile: 'Edit profile',
    personalization: 'Personalization',
    darkMode: 'Dark Mode',
    language: 'Language',
    privacyAndSecurity: 'Privacy and Security',
    alertsNotification: 'Alerts Notification',
    dailySpending: 'Daily Spending',
    dailyLimitLabel: 'Daily Limit (Ksh)',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    logout: 'Log out',
    profileDialogTitle: 'Update account',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    saveChanges: 'Save changes',
    accountUpdated: 'Account details updated.',
  },
  Swahili: {
    settings: 'Mipangilio',
    account: 'Akaunti',
    editProfile: 'Hariri wasifu',
    personalization: 'Mapendeleo',
    darkMode: 'Mandhari ya giza',
    language: 'Lugha',
    privacyAndSecurity: 'Faragha na Usalama',
    alertsNotification: 'Arifa',
    dailySpending: 'Matumizi ya kila siku',
    dailyLimitLabel: 'Kikomo cha kila siku (Ksh)',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    saving: 'Inahifadhi...',
    logout: 'Ondoka',
    profileDialogTitle: 'Sasisha akaunti',
    fullName: 'Jina kamili',
    phoneNumber: 'Nambari ya simu',
    saveChanges: 'Hifadhi mabadiliko',
    accountUpdated: 'Maelezo ya akaunti yamesasishwa.',
  },
};

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
  const { user, logout, refreshUser } = useAuth();
  const { setToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const name = user?.name ?? user?.full_name ?? user?.username ?? 'User';
  const contact = user?.mobile_number ?? user?.phone_number ?? user?.phone ?? '';
  const isStudent = !isStaff(location.pathname) && !isAdmin(location.pathname);
  const roleLabel = isAdmin(location.pathname) ? 'Admin' : isStaff(location.pathname) ? 'Staff' : 'Student';
  const backTo = isStaff(location.pathname) ? '/staff/orders' : '/student/home';

  const [dailyLimit, setDailyLimit] = useState('');
  const [initialDailyLimit, setInitialDailyLimit] = useState('');
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(name);
  const [profilePhone, setProfilePhone] = useState(contact);
  const [profileSaving, setProfileSaving] = useState(false);
  const t = COPY[language] ?? COPY.English;

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
      document.documentElement.classList.toggle('dark', darkModeEnabled);
      document.body.classList.toggle('dark', darkModeEnabled);
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
    setProfileName(name);
    setProfilePhone(contact);
  }, [name, contact]);

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

  const handlePrivacyClick = () => {
    setToast('Privacy and Security links are informational in this frontend-only version.', 'success');
  };

  const handleChangeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    setToast(`Language set to ${nextLanguage}.`, 'success');
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }
    navigate(backTo, { replace: true });
  };

  const handleSaveProfile = async () => {
    const fullName = profileName.trim();
    const mobileNumber = profilePhone.trim();
    if (!fullName) {
      setToast('Full name is required.', 'error');
      return;
    }

    const payload = {
      full_name: fullName,
      mobile_number: mobileNumber || undefined,
    };

    setProfileSaving(true);
    try {
      try {
        await updateMe(payload);
      } catch {
        try {
          await updateMyDetails(payload, 'PATCH');
        } catch {
          await updateMyDetails(payload, 'PUT');
        }
      }
      await refreshUser();
      setIsProfileModalOpen(false);
      setToast(t.accountUpdated, 'success');
    } catch (err) {
      setToast(err?.message ?? 'Failed to update account details.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-edueats-bg pb-24">
      {/* Header with Avatar */}
      <header className="bg-edueats-primary px-6 pt-10 pb-8 text-center">
        <div className="flex justify-start">
          <button type="button" onClick={handleBack} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm text-edueats-text">
            <FiArrowLeft className="text-sm" />
            Back
          </button>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-edueats-accent to-edueats-primary shadow-md" />
        </div>
        <p className="text-sm text-edueats-textMuted">{t.settings}</p>
        <p className="text-lg font-semibold text-edueats-text">{name}</p>
        <p className="text-sm text-edueats-textMuted">{roleLabel}</p>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Account Section */}
        <Card className="mb-4 px-0 py-0">
          <p className="mb-3 border-b border-edueats-border px-4 py-2 text-xs font-semibold uppercase text-edueats-textMuted">
            {t.account}
          </p>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-between px-4 py-3 text-edueats-text hover:bg-edueats-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiEdit className="text-edueats-textMuted" />
              <span>{t.editProfile}</span>
            </div>
            <FiChevronRight className="text-edueats-textMuted" />
          </button>
        </Card>

        {/* Personalization Section */}
        <Card className="mb-4 px-0 py-0">
          <p className="mb-3 border-b border-edueats-border px-4 py-2 text-xs font-semibold uppercase text-edueats-textMuted">
            {t.personalization}
          </p>

          {/* Dark Mode */}
          <div className="flex items-center justify-between border-b border-edueats-border px-4 py-3">
            <div className="flex items-center gap-3">
              <FiMoon className="text-edueats-textMuted" />
              <span className="text-edueats-text">{t.darkMode}</span>
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
          <div className="flex w-full items-center justify-between border-b border-edueats-border px-4 py-3">
            <div className="flex items-center gap-3">
              <FiGlobe className="text-edueats-textMuted" />
              <span className="text-edueats-text">{t.language}</span>
            </div>
            <select
              value={language}
              onChange={(e) => handleChangeLanguage(e.target.value)}
              className="rounded-full border border-edueats-border bg-edueats-surface px-3 py-1.5 text-sm text-edueats-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edueats-accent"
              aria-label="Select language"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy and Security */}
          <button
            type="button"
            onClick={handlePrivacyClick}
            className="flex w-full items-center justify-between border-b border-edueats-border px-4 py-3 text-left hover:bg-edueats-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <FiLock className="text-edueats-textMuted" />
              <span className="text-edueats-text">{t.privacyAndSecurity}</span>
            </div>
            <FiChevronRight className="text-edueats-textMuted" />
          </button>

          {/* Alerts Notification */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <FiBell className="text-edueats-textMuted" />
              <span className="text-edueats-text">{t.alertsNotification}</span>
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
              {t.dailySpending}
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
                      <p className="text-xs text-edueats-textMuted">{t.dailyLimitLabel}</p>
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
                      label={t.dailyLimitLabel}
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
                      {limitLoading ? t.saving : t.save}
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
                      {t.cancel}
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
          {t.logout}
        </button>
      </div>
      <Modal
        isOpen={isProfileModalOpen}
        title={t.profileDialogTitle}
        onClose={() => setIsProfileModalOpen(false)}
        primaryAction={{
          label: profileSaving ? t.saving : t.saveChanges,
          onClick: handleSaveProfile,
          disabled: profileSaving,
        }}
        secondaryAction={{
          label: t.cancel,
          onClick: () => setIsProfileModalOpen(false),
        }}
      >
        <div className="space-y-3">
          <Input
            label={t.fullName}
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Enter your full name"
            disabled={profileSaving}
          />
          <Input
            label={t.phoneNumber}
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            placeholder="e.g. 07XXXXXXXX"
            disabled={profileSaving}
          />
        </div>
      </Modal>
    </div>
  );
}
