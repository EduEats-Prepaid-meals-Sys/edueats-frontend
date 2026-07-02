import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button.jsx';
import logo from '../../../assets/images/logo.svg';
import splashIllustration from '../../../assets/images/splash-illustration.svg';
import { getAppInfo, getDashboardSummary } from '../../../api/modules/utilsApi.js';
import { useDarkMode } from '../../../utils/useDarkMode.js';

const DEFAULT_STATS = [
  { num: '2k+', label: 'Students' },
  { num: '3', label: 'Meals/day' },
  { num: '99%', label: 'Uptime' },
];

export default function SplashPage() {
  const [isDark, toggleDark] = useDarkMode();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const [appInfo, summary] = await Promise.allSettled([
          getAppInfo(),
          getDashboardSummary(),
        ]);

        if (cancelled) return;

        const info = appInfo.status === 'fulfilled' ? appInfo.value : null;
        const dash = summary.status === 'fulfilled' ? summary.value : null;

        const studentCount = info?.student_count ?? info?.total_students ?? info?.users_count;
        const mealCount = dash?.todays_meals ?? dash?.total_meals ?? dash?.meals_today ?? dash?.menu_items_today;

        setStats([
          {
            num: studentCount != null
              ? studentCount >= 1000
                ? `${(studentCount / 1000).toFixed(studentCount < 10000 ? 1 : 0)}k+`
                : `${studentCount}+`
              : '2k+',
            label: 'Students',
          },
          {
            num: mealCount != null ? String(mealCount) : '3',
            label: 'Meals/day',
          },
          { num: '99%', label: 'Uptime' },
        ]);
      } catch {
        // silently keep defaults
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const features = [
    {
      label: 'Digital mess wallet',
      sub: 'Top up via M-Pesa, spend with a tap',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="4" width="14" height="11" rx="2" stroke="white" strokeWidth="1.5"/>
          <path d="M6 4V3C6 2.4 6.4 2 7 2H11C11.6 2 12 2.4 12 3V4" stroke="white" strokeWidth="1.5"/>
          <path d="M5 9H13M5 12H10" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Live daily menu',
      sub: "See today's meals & availability",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.5"/>
          <path d="M9 5V9L12 11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Spending limits & reports',
      sub: 'Stay on budget, weekly tracking',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 14L7 10L10 13L15 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-edueats-primary overflow-hidden flex flex-col items-center px-6 pt-12 pb-24">

      {/* Background decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-80 h-80 -top-28 -right-28 rounded-full bg-white/[0.06]" />
        <div className="absolute w-52 h-52 bottom-10 -left-20 rounded-full bg-white/[0.06]" />
        <div className="absolute w-24 h-24 top-1/2 right-3 rounded-full bg-white/[0.04]" />
      </div>

      {/* Background illustration */}
      <div className="absolute inset-0 opacity-25">
        <img src={splashIllustration} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Dark mode toggle — top right */}
      <button
        type="button"
        onClick={toggleDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute top-4 right-4 z-20 text-xl leading-none opacity-70 hover:opacity-100 transition-opacity"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="relative z-10 flex flex-col items-center w-full">

        {/* University context pills */}
        <div className="flex gap-2 flex-wrap justify-center mt-4">
          <span className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
            Egerton University
          </span>
          <span className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1 text-xs text-white/90">
            Mess Wallet System
          </span>
        </div>

        {/* Logo */}
        <div className="mt-10 flex flex-col items-center text-center">
          <div className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center mb-4 p-3">
            <img src={logo} alt="EduEats" className="h-full w-auto" />
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight leading-none">EduEats</h1>
          <p className="mt-2 text-sm text-edueats-textMuted">Smart dining, happy learning</p>
        </div>

        {/* Divider */}
        <div className="w-9 h-0.5 bg-white/20 rounded-full my-8" />

        {/* Stats — live from API, fallback to defaults */}
        <div className="flex gap-8 justify-center">
          {stats.map(({ num, label }) => (
            <div key={label} className="text-center">
              {statsLoading ? (
                <div className="h-7 w-12 rounded-md bg-white/20 animate-pulse mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-semibold text-white">{num}</p>
              )}
              <p className="text-[11px] text-white/60 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="flex flex-col gap-2.5 mt-8 w-full max-w-sm">
          {features.map(({ label, sub, icon }) => (
            <div
              key={label}
              className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/80 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-9 w-full max-w-sm space-y-2.5">
          <Link to="/login" className="block">
            <Button variant="secondary" fullWidth>Login</Button>
          </Link>
          <Link to="/register" className="block">
            <Button fullWidth>Get Started</Button>
          </Link>
          <p className="pt-2 text-center text-sm text-edueats-textMuted">
            <Link to="/staff/login">Staff login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
