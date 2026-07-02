import React from 'react';
import clsx from 'clsx';

/**
 * Full-viewport auth page shell.
 *
 * Props:
 *   header         — ReactNode rendered inside the header band
 *   children       — form content, centred in a narrow column
 *   staffVariant   — if true, applies the teal staff gradient; otherwise yellow student header
 */
export default function AuthLayout({ header, children, staffVariant = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-edueats-bg">
      {/* Full-bleed header */}
      <header
        className={clsx(
          'w-full',
          staffVariant
            ? 'bg-edueats-staff shadow-card'
            : 'bg-edueats-primary'
        )}
        style={
          staffVariant
            ? { background: 'linear-gradient(to right, #0E7F74, #085F56)' }
            : undefined
        }
      >
        <div className="mx-auto w-full max-w-lg px-6 py-6">
          {header}
        </div>
      </header>

      {/* Centered content column */}
      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
