import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useDarkMode } from '../utils/useDarkMode.js';

/**
 * variant: 'student' (default, orange) | 'staff' (teal)
 */
const BottomNav = ({ items, variant = 'student' }) => {
  const location = useLocation();
  const [isDark, toggleDark] = useDarkMode();

  if (!items || items.length === 0) return null;

  const isStaff = variant === 'staff';
  const navBg = isStaff
    ? 'bg-edueats-staff/95'
    : 'bg-edueats-accent/95';

  return (
    <nav
      className={clsx(
        'fixed inset-x-0 bottom-0 z-30 border-t border-white/10 px-4 py-2.5 text-xs text-white',
        navBg
      )}
    >
      <div className="mx-auto flex max-w-6xl lg:max-w-5xl xl:max-w-4xl items-center justify-between gap-2">
        {items.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(
                'flex flex-1 flex-col items-center gap-0.5',
                isActive ? 'font-semibold' : 'opacity-75'
              )}
            >
              {item.icon ? (
                <span
                  className={clsx(
                    'mb-0.5 text-lg leading-none',
                    isActive ? 'text-white' : 'text-white/80'
                  )}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className="flex flex-col items-center gap-0.5 opacity-75 hover:opacity-100 transition-opacity"
        >
          <span className="mb-0.5 text-lg leading-none" aria-hidden="true">
            {isDark ? '☀️' : '🌙'}
          </span>
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
