import React from 'react';
import clsx from 'clsx';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={clsx('animate-pulse rounded bg-edueats-border', className)}
      {...props}
    />
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="rounded-card bg-edueats-surface p-4 shadow-card flex flex-row items-center gap-4">
      <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="flex w-36 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg">
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function PaymentRowSkeleton() {
  return (
    <div className="rounded-card bg-edueats-surface p-4 shadow-card flex flex-row items-center justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3 w-12 ml-4" />
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="rounded-card bg-edueats-surface p-4 shadow-card space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }) {
  return (
    <div className={clsx('rounded-card bg-edueats-surface p-4 shadow-card space-y-2', className)}>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  );
}

export function ChartSkeleton({ height = 'h-36', className }) {
  return (
    <div className={clsx('rounded-card bg-edueats-surface p-4 shadow-card', className)}>
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className={clsx(height, 'w-full rounded-md')} />
    </div>
  );
}
