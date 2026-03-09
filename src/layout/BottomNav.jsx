import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const BottomNav = ({ items }) => {
  const location = useLocation();

  if (!items || items.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-edueats-border bg-edueats-accent/95 px-6 py-2.5 text-xs text-white">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
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
                isActive ? 'font-semibold' : 'opacity-80'
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
      </div>
    </nav>
  );
};

export default BottomNav;
