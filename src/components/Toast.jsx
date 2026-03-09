import React from 'react';
import clsx from 'clsx';

const variantClasses = {
  info: 'bg-edueats-surface text-edueats-text',
  success: 'bg-edueats-success/10 text-edueats-success',
  error: 'bg-edueats-danger/10 text-edueats-danger',
};

const Toast = ({ message, variant = 'info' }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
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
