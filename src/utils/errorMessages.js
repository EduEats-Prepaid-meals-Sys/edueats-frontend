/**
 * Centralized API error → friendly 3-part message mapper.
 *
 * Each error is shaped as:
 *   { title, detail, action, actionPath, category }
 *
 * Categories:
 *   auth       – wrong credentials, session expired, verification needed
 *   validation – field-level or password-policy failures
 *   business   – balance, limits, stock, availability
 *   permission – role-based access denied
 *   not_found  – record does not exist
 *   server     – payment gateway, unexpected server error
 */

const PATTERNS = [
  // ── Verification / Email flow ─────────────────────────────────────────────
  {
    test: /verification code expired/i,
    title: 'Code expired',
    detail: 'Your verification code has expired.',
    action: 'Request a new code',
    actionPath: '/verify-email',
    category: 'auth',
  },
  {
    test: /invalid verification code/i,
    title: 'Incorrect code',
    detail: 'That code is incorrect. Check the 6-digit code sent to your email.',
    action: 'Try again',
    category: 'validation',
  },
  {
    test: /email verification required/i,
    title: 'Verify your email first',
    detail: 'Enter the 6-digit code sent to your student email before logging in.',
    action: 'Enter code',
    actionPath: '/verify-code',
    category: 'auth',
  },
  {
    test: /account is already verified/i,
    title: 'Already verified',
    detail: 'Your email is already verified.',
    action: 'Log in',
    actionPath: '/login',
    category: 'auth',
  },
  {
    test: /reset code expired/i,
    title: 'Reset code expired',
    detail: 'Your password reset code has expired.',
    action: 'Request a new code',
    category: 'auth',
  },
  {
    test: /invalid email or reset code/i,
    title: 'Invalid reset code',
    detail: 'The reset code is incorrect or has expired.',
    action: 'Request a new code',
    category: 'auth',
  },
  {
    test: /no student account found/i,
    title: 'Account not found',
    detail: 'No student account was found with this email.',
    action: 'Register instead',
    actionPath: '/register',
    category: 'not_found',
  },
  {
    test: /invalid credentials/i,
    title: 'Login failed',
    detail: 'Your email or password is incorrect.',
    action: 'Try again',
    category: 'auth',
  },

  // ── Registration ──────────────────────────────────────────────────────────
  {
    test: /user with this email already exists/i,
    title: 'Email already in use',
    detail: 'An account with this email already exists.',
    action: 'Log in instead',
    actionPath: '/login',
    category: 'validation',
  },
  {
    test: /user with this staff id already exists/i,
    title: 'Staff ID taken',
    detail: 'This staff ID is already registered.',
    action: 'Use a different staff ID',
    category: 'validation',
  },
  {
    test: /student email must end with/i,
    title: 'Invalid student email',
    detail: 'Your email must end with @student.egerton.ac.ke.',
    action: 'Use your university email',
    category: 'validation',
  },
  {
    test: /staff id is required/i,
    title: 'Staff ID required',
    detail: 'A staff ID is required for mess admin and waitress roles.',
    action: 'Enter your staff ID',
    category: 'validation',
  },

  // ── Password ──────────────────────────────────────────────────────────────
  {
    test: /password must (be at least|contain)/i,
    title: 'Weak password',
    detail:
      'Password must have at least 8 characters, 1 letter, 1 number, and 1 symbol (e.g. !@#$%).',
    action: 'Update your password',
    category: 'validation',
  },
  {
    test: /ensure this field has at least.*character/i,
    title: 'Password too short',
    detail: 'Password must be at least 8 characters long.',
    action: 'Update your password',
    category: 'validation',
  },

  // ── Wallet / Balance / Limits ─────────────────────────────────────────────
  // NOTE: detail is injected at runtime with contextual amounts
  {
    test: /insufficient wallet balance/i,
    title: 'Insufficient balance',
    detail: null,
    action: 'Top up wallet',
    actionPath: '/student/wallet',
    category: 'business',
  },
  {
    test: /daily spending limit exceeded/i,
    title: 'Daily limit reached',
    detail: null,
    action: 'Try again tomorrow or reduce your order',
    category: 'business',
  },
  {
    test: /weekly spending limit exceeded/i,
    title: 'Weekly limit reached',
    detail: null,
    action: 'Try again later or reduce your order',
    category: 'business',
  },

  // ── Orders / Menu ─────────────────────────────────────────────────────────
  {
    test: /requested quantity exceeds available stock/i,
    title: 'Not enough stock',
    detail: "This meal doesn't have enough portions left.",
    action: 'Reduce quantity or choose another meal',
    category: 'business',
  },
  {
    test: /selected meal .* is currently unavailable/i,
    title: 'Meal unavailable',
    detail: "This meal has been removed from today's menu.",
    action: 'Go back to menu',
    actionPath: '/student/menu',
    category: 'business',
  },
  {
    test: /selected meal is currently unavailable/i,
    title: 'Meal unavailable',
    detail: 'This meal is no longer available.',
    action: 'Go back to menu',
    actionPath: '/student/menu',
    category: 'business',
  },
  {
    test: /orders can only be placed for today/i,
    title: 'Menu expired',
    detail: "Orders can only be placed for today's menu.",
    action: "Check today's menu",
    actionPath: '/student/menu',
    category: 'business',
  },
  {
    test: /checkout is only allowed for today/i,
    title: 'Order expired',
    detail: "Checkout is only allowed for today's menu items.",
    action: "Go back to menu",
    actionPath: '/student/menu',
    category: 'business',
  },
  {
    test: /only active meals can be added/i,
    title: 'Meal inactive',
    detail: 'Only active meals can be added to the daily menu.',
    action: 'Activate the meal first',
    category: 'business',
  },
  {
    test: /only draft orders can be deleted/i,
    title: 'Cannot delete order',
    detail: 'Only draft orders can be removed before checkout.',
    action: null,
    category: 'business',
  },
  {
    test: /no draft orders found for checkout/i,
    title: 'Cart empty',
    detail: 'No orders in your cart are ready for checkout.',
    action: 'Go back to menu',
    actionPath: '/student/menu',
    category: 'business',
  },

  // ── Meal catalog / Daily menu ─────────────────────────────────────────────
  {
    test: /meal with this name already exists/i,
    title: 'Duplicate meal name',
    detail: 'A meal with this name already exists in the catalog.',
    action: 'Use a different name',
    category: 'validation',
  },
  {
    test: /the fields menu_date, meal must make a unique set/i,
    title: "Already on today's menu",
    detail: 'This meal is already on the daily menu for today.',
    action: 'Edit the existing entry instead',
    category: 'validation',
  },

  // ── Not found ─────────────────────────────────────────────────────────────
  {
    test: /meal not found/i,
    title: 'Meal not found',
    detail: 'This meal may have been removed.',
    action: 'Refresh and try again',
    category: 'not_found',
  },
  {
    test: /order not found/i,
    title: 'Order not found',
    detail: "We couldn't find that order. It may have been removed.",
    action: 'Refresh and try again',
    category: 'not_found',
  },
  {
    test: /payment not found/i,
    title: 'Payment not found',
    detail: "We couldn't find that payment.",
    action: 'Refresh and try again',
    category: 'not_found',
  },
  {
    test: /daily menu entry not found/i,
    title: 'Menu entry not found',
    detail: 'This daily menu entry may have been removed.',
    action: 'Refresh and try again',
    category: 'not_found',
  },
  {
    test: /user not found/i,
    title: 'User not found',
    detail: "This account doesn't exist.",
    action: 'Check the details and try again',
    category: 'not_found',
  },
  {
    test: /(top-up|receipt).*not found/i,
    title: 'Record not found',
    detail: "We couldn't find that record.",
    action: 'Refresh and try again',
    category: 'not_found',
  },

  // ── Permissions ───────────────────────────────────────────────────────────
  {
    test: /only (admins?|students?|staff|mess|caterers?|waitress) can/i,
    title: 'Access denied',
    detail: "You don't have permission to do this.",
    action: 'Log in with the correct account',
    category: 'permission',
  },
  {
    test: /only authenticated/i,
    title: 'Sign in required',
    detail: 'You need to be signed in to do this.',
    action: 'Log in',
    actionPath: '/login',
    category: 'auth',
  },
  {
    test: /authentication credentials were not provided/i,
    title: 'Session expired',
    detail: 'Your session has ended. Please log in again.',
    action: 'Log in',
    actionPath: '/login',
    category: 'auth',
  },
  {
    test: /admin cannot delete their own account/i,
    title: 'Not allowed',
    detail: 'An admin cannot delete their own account.',
    action: null,
    category: 'permission',
  },

  // ── Wallet top-up / Payment ───────────────────────────────────────────────
  {
    test: /phone number must be a valid safaricom/i,
    title: 'Invalid phone number',
    detail: 'Enter a valid Safaricom number (starting 07xx or 01xx).',
    action: 'Update phone number',
    category: 'validation',
  },
  {
    test: /unable to reach payment gateway/i,
    title: 'Payment gateway unreachable',
    detail: 'Unable to reach the payment service. Please try again.',
    action: 'Retry',
    category: 'server',
  },
  {
    test: /failed to initiate top-up/i,
    title: 'Top-up failed',
    detail: 'Could not start the top-up. Please try again.',
    action: 'Retry',
    category: 'server',
  },
  {
    test: /payment failed/i,
    title: 'Payment failed',
    detail: 'The payment could not be completed.',
    action: 'Try again or contact support',
    category: 'business',
  },
  {
    test: /invalid callback signature/i,
    title: 'Verification error',
    detail: 'Payment verification failed.',
    action: 'Contact support',
    category: 'server',
  },

  // ── Generic DRF serializer errors ─────────────────────────────────────────
  {
    test: /this field is required/i,
    title: 'Required field missing',
    detail: null,
    action: 'Fill in all required fields',
    category: 'validation',
  },
  {
    test: /enter a valid email address/i,
    title: 'Invalid email',
    detail: 'Please enter a valid email address.',
    action: 'Update email',
    category: 'validation',
  },
  {
    test: /ensure this value is greater than or equal to/i,
    title: 'Value too low',
    detail: null,
    action: 'Enter a larger value',
    category: 'validation',
  },
  {
    test: /".*" is not a valid choice/i,
    title: 'Invalid selection',
    detail: null,
    action: 'Select a valid option',
    category: 'validation',
  },
  {
    test: /a valid integer is required/i,
    title: 'Invalid number',
    detail: 'Please enter a whole number.',
    action: 'Update the field',
    category: 'validation',
  },
  {
    test: /this list may not be empty/i,
    title: 'Empty list',
    detail: 'At least one item is required.',
    action: 'Add an item',
    category: 'validation',
  },
];

const ksh = (n) => `KSh ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Map an API error to a user-friendly 3-part error object.
 *
 * @param {Object} err - Error thrown by apiRequest. Has .status, .message, .rawMessages, .details
 * @param {Object} ctx - Optional context for richer messages: { balance, total, dailyLimit, weeklyLimit }
 * @returns {{ title, detail, action, actionPath, category }}
 */
export const mapApiError = (err, ctx = {}) => {
  if (!err) {
    return {
      title: 'Something went wrong',
      detail: 'An unexpected error occurred.',
      action: 'Try again',
      actionPath: null,
      category: 'server',
    };
  }

  const rawMessages =
    Array.isArray(err.rawMessages) && err.rawMessages.length > 0
      ? err.rawMessages
      : [String(err.message || '')];

  for (const raw of rawMessages) {
    for (const pattern of PATTERNS) {
      if (pattern.test.test(raw)) {
        const mapped = { actionPath: null, ...pattern };

        // Inject context-aware amounts for wallet/limit errors
        if (/insufficient wallet balance/i.test(raw)) {
          const needed = ctx.total != null ? ksh(ctx.total) : 'more';
          const have = ctx.balance != null ? ksh(ctx.balance) : null;
          mapped.detail = have
            ? `Your wallet has ${have} but this order needs ${needed}.`
            : `Your wallet balance is too low for this order${ctx.total != null ? ` (${needed} needed)` : ''}.`;
        }

        if (/daily spending limit exceeded/i.test(raw)) {
          mapped.detail =
            ctx.dailyLimit != null
              ? `You can spend up to ${ksh(ctx.dailyLimit)} per day. Your daily limit has been reached.`
              : 'You have reached your daily spending limit.';
        }

        if (/weekly spending limit exceeded/i.test(raw)) {
          mapped.detail =
            ctx.weeklyLimit != null
              ? `You can spend up to ${ksh(ctx.weeklyLimit)} per week. Your weekly limit has been reached.`
              : 'You have reached your weekly spending limit.';
        }

        return mapped;
      }
    }
  }

  // Status-code fallbacks
  const status = err.status || 0;

  if (status === 401) {
    return {
      title: 'Login required',
      detail: 'Your session has expired or the credentials are incorrect.',
      action: 'Log in again',
      actionPath: '/login',
      category: 'auth',
    };
  }

  if (status === 402) {
    const needed = ctx.total != null ? ksh(ctx.total) : null;
    const have = ctx.balance != null ? ksh(ctx.balance) : null;
    return {
      title: 'Insufficient balance',
      detail:
        have && needed
          ? `Your wallet has ${have} but this order needs ${needed}.`
          : "Your wallet doesn't have enough funds.",
      action: 'Top up wallet',
      actionPath: '/student/wallet',
      category: 'business',
    };
  }

  if (status === 403) {
    return {
      title: 'Access denied',
      detail: "You don't have permission to do this.",
      action: 'Log in with the correct account',
      actionPath: null,
      category: 'permission',
    };
  }

  if (status === 404) {
    return {
      title: 'Not found',
      detail: "We couldn't find that record. It may have been removed.",
      action: 'Refresh and try again',
      actionPath: null,
      category: 'not_found',
    };
  }

  if (status >= 500) {
    return {
      title: 'Server error',
      detail: 'Something went wrong on our end. Please try again shortly.',
      action: 'Retry',
      actionPath: null,
      category: 'server',
    };
  }

  return {
    title: 'Something went wrong',
    detail: err.message || 'An unexpected error occurred.',
    action: 'Try again',
    actionPath: null,
    category: 'server',
  };
};

/**
 * Extract field-level validation errors from a backend error—
 * returns { fieldName: 'human-readable message', ... }
 */
export const mapFieldErrors = (err) => {
  if (!err?.details || typeof err.details !== 'object') return {};

  const ALIASES = {
    non_field_errors: '_general',
    mobile_number: 'contact',
    phone_number: 'contact',
    reg_number: 'contact',
  };

  const out = {};
  for (const [key, value] of Object.entries(err.details)) {
    const mapped = ALIASES[key] ?? key;
    const raw = Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');
    if (!raw) continue;
    out[mapped] = applyPatternToField(raw);
  }
  return out;
};

const applyPatternToField = (raw) => {
  for (const pattern of PATTERNS) {
    if (pattern.test.test(raw)) {
      return pattern.detail ?? pattern.title;
    }
  }
  // Capitalise first letter, ensure ends with period
  const msg = raw.charAt(0).toUpperCase() + raw.slice(1);
  return msg.endsWith('.') ? msg : `${msg}.`;
};
