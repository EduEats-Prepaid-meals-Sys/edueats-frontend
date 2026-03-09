import React from 'react';
import clsx from 'clsx';

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-card bg-edueats-surface p-4 shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
