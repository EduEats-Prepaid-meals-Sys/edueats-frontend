import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';

const STYLES = {
  auth: {
    wrap: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    detail: 'text-red-700',
    action: 'text-red-600 hover:text-red-800',
    Icon: FiAlertCircle,
  },
  permission: {
    wrap: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    detail: 'text-red-700',
    action: 'text-red-600 hover:text-red-800',
    Icon: FiXCircle,
  },
  validation: {
    wrap: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-500',
    title: 'text-orange-800',
    detail: 'text-orange-700',
    action: 'text-orange-600 hover:text-orange-800',
    Icon: FiAlertTriangle,
  },
  business: {
    wrap: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    detail: 'text-amber-700',
    action: 'text-amber-700 hover:text-amber-900',
    Icon: FiAlertTriangle,
  },
  not_found: {
    wrap: 'bg-gray-50 border-gray-200',
    icon: 'text-gray-400',
    title: 'text-gray-700',
    detail: 'text-gray-500',
    action: 'text-gray-600 hover:text-gray-800',
    Icon: FiInfo,
  },
  server: {
    wrap: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    detail: 'text-red-700',
    action: 'text-red-600 hover:text-red-800',
    Icon: FiAlertCircle,
  },
};

/**
 * Displays a structured 3-part error: title + detail + action link/button.
 *
 * @param {{ title, detail, action, actionPath, category }} error - Mapped error from mapApiError()
 * @param {Function}   onAction   - Optional click handler for the action (overrides actionPath navigation)
 * @param {string}     className  - Additional Tailwind classes
 */
const ErrorBanner = ({ error, onAction, className = '' }) => {
  if (!error) return null;

  const { title, detail, action, actionPath, category = 'server' } = error;
  const s = STYLES[category] ?? STYLES.server;
  const { Icon } = s;

  const actionEl = action
    ? onAction
      ? (
        <button
          type="button"
          onClick={onAction}
          className={`mt-1 text-xs font-semibold underline underline-offset-2 ${s.action}`}
        >
          {action} →
        </button>
      )
      : actionPath
        ? (
          <Link
            to={actionPath}
            className={`mt-1 block text-xs font-semibold underline underline-offset-2 ${s.action}`}
          >
            {action} →
          </Link>
        )
        : (
          <p className={`mt-1 text-xs font-semibold ${s.action}`}>{action}</p>
        )
    : null;

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-xl border px-4 py-3 ${s.wrap} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug ${s.title}`}>{title}</p>
        {detail && (
          <p className={`mt-0.5 text-xs leading-relaxed ${s.detail}`}>{detail}</p>
        )}
        {actionEl}
      </div>
    </div>
  );
};

export default ErrorBanner;
