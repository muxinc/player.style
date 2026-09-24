'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

import { focusRing } from './ui';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

type SegmentedControlProps<T extends string> = {
  value: T | null;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  'aria-label': string;
  className?: string;
  /** The control is not ready yet, for example before hydration; shows a wait cursor. */
  pending?: boolean;
};

/** Single-choice control: a recessed track with one raised, pressed segment, as on the Video.js 10 site. */
export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel,
  className,
  pending = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        'grid w-full grid-flow-col auto-cols-fr gap-1 rounded-lg corner-squircle border border-line bg-surface p-1',
        pending && 'opacity-60',
        className
      )}
    >
      {options.map((option) => {
        const pressed = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            disabled={pending}
            onClick={() => onChange(option.value)}
            className={clsx(
              'flex min-w-0 items-center justify-center gap-2 rounded-md corner-squircle px-3 py-1.5 text-p3 leading-tight whitespace-nowrap select-none',
              focusRing,
              pending ? 'cursor-wait' : 'cursor-pointer',
              pressed
                ? 'bg-surface-raised font-semibold text-faded-black shadow-xs ring-1 ring-line dark:text-manila-light'
                : 'text-muted intent:text-faded-black dark:intent:text-manila-light'
            )}
          >
            {option.icon && (
              <span
                aria-hidden="true"
                className={clsx('inline-flex size-4 shrink-0 items-center justify-center', !pressed && 'opacity-70')}
              >
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
