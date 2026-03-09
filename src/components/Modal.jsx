import React from 'react';
import Button from './Button.jsx';

const Modal = ({
  isOpen,
  title,
  children,
  primaryAction,
  secondaryAction,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-card bg-edueats-surface p-6 shadow-card">
        {title && (
          <h2 className="mb-3 text-lg font-semibold text-edueats-text">
            {title}
          </h2>
        )}
        <div className="mb-4 text-sm text-edueats-textMuted">{children}</div>
        <div className="flex justify-end gap-2">
          {secondaryAction && (
            <Button
              variant="secondary"
              type="button"
              onClick={secondaryAction.onClick || onClose}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
