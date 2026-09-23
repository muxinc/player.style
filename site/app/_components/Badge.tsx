import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'default' | 'accent';
  className?: string;
  children: ReactNode;
};

export default function Badge({ tone = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-0.5 py-[3px] font-mono text-xs leading-mono tracking-wide uppercase',
        tone === 'accent' ? 'border-blue-dark bg-blue text-white' : 'border-gray bg-putty-light text-black',
        className
      )}
    >
      {children}
    </span>
  );
}
