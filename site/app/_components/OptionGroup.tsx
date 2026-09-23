'use client';

import clsx from 'clsx';

import { useSearchParamUpdater } from './useSearchParamUpdater';

type OptionGroupProps<Id extends string> = {
  label: string;
  param: string;
  options: readonly { id: Id; label: string }[];
  value: Id;
  /** The option that maps to no param at all, so the URL stays clean until the user changes something. */
  defaultValue: Id;
};

/** A row of toggle buttons that writes the picked option to a search param. */
export default function OptionGroup<Id extends string>({
  label,
  param,
  options,
  value,
  defaultValue,
}: OptionGroupProps<Id>) {
  const { update } = useSearchParamUpdater();

  const pick = (id: Id) => {
    update((params) => {
      if (id === defaultValue) params.delete(param);
      else params.set(param, id);
    });
  };

  return (
    <div className="flex flex-col gap-0.25">
      <p className="leading-mono font-mono text-sm uppercase" id={`${param}-label`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-0.25" role="group" aria-labelledby={`${param}-label`}>
        {options.map((option) => {
          const active = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => pick(option.id)}
              className={clsx(
                'rounded-full border px-0.75 py-0.25 font-mono text-xs leading-mono tracking-wide uppercase',
                active
                  ? 'border-charcoal bg-charcoal text-white'
                  : 'border-gray bg-white text-black hover:border-charcoal'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
