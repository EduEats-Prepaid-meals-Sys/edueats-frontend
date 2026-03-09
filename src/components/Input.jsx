import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(function Input(
  { className, label, hint, error, type = 'text', ...props },
  ref
) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="text-edueats-text">{label}</span>}
      <input
        ref={ref}
        type={type}
        className={clsx(
          'w-full rounded-full border bg-white px-4 py-2.5 text-sm text-edueats-text placeholder:text-edueats-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-edueats-accent',
          error ? 'border-edueats-danger' : 'border-edueats-border',
          className
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-edueats-danger">{error}</span>
      ) : (
        hint && <span className="text-xs text-edueats-textMuted">{hint}</span>
      )}
    </label>
  );
});

export default Input;
