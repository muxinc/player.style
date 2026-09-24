import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'default' | 'accent';
  className?: string;
  children: ReactNode;
};

/** A small metadata chip; the accent tone marks community skins. */
export default function Badge({ tone = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex h-4.5 items-center rounded-md corner-squircle px-1.5 text-p4 leading-none font-medium whitespace-nowrap capitalize',
        tone === 'accent'
          ? 'bg-accent/12 text-accent dark:bg-accent/15'
          : 'bg-surface-raised text-muted ring-1 ring-line',
        className
      )}
    >
      {children}
    </span>
  );
}
