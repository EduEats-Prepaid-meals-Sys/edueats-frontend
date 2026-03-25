import React, { useEffect } from 'react';
import clsx from 'clsx';

const variantClasses = {
  info: 'bg-edueats-surface text-edueats-text',
  success: 'bg-edueats-success/10 text-edueats-success',
  error: 'bg-edueats-danger/10 text-edueats-danger',
};

const AUTO_DISMISS_MS = 3500;

const Toast = ({ message, variant = 'info', onRequestClose }) => {
  useEffect(() => {
    if (!message || typeof onRequestClose !== 'function') return undefined;

    const id = window.setTimeout(() => {
      onRequestClose();
    }, AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(id);
    };
  }, [message, onRequestClose]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        className={clsx(
          'w-full max-w-sm rounded-full px-4 py-3 text-sm shadow-card',
          variantClasses[variant] || variantClasses.info
        )}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
