import React from 'react';
import clsx from 'clsx';

const baseClasses =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-edueats-accent disabled:opacity-60 disabled:cursor-not-allowed transition';

const variantClasses = {
  primary: 'bg-edueats-accent text-white',
  secondary: 'bg-edueats-surfaceAlt text-edueats-text',
  ghost: 'bg-transparent text-edueats-text',
};

const fullWidthClasses = 'w-full';

const Button = ({ variant = 'primary', fullWidth = false, className, ...props }) => {
  const classes = clsx(
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    fullWidth && fullWidthClasses,
    className
  );

  return <button className={classes} {...props} />;
};

export default Button;
