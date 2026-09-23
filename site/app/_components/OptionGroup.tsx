import clsx from 'clsx';

import { buildHref, type SearchParamsInput } from '@/lib/search-params';

import AccentLink from './AccentLink';

type OptionGroupProps<Id extends string> = {
  label: string;
  param: string;
  options: readonly { id: Id; label: string }[];
  value: Id;
  /** The option that maps to no param at all, so the URL stays clean until the user changes something. */
  defaultValue: Id;
  /** The current page, whose other params each option's link keeps. */
  pathname: string;
  searchParams: SearchParamsInput;
};

/** A row of links that each set the search param to one option, so every combination is a crawlable URL. */
export default function OptionGroup<Id extends string>({
  label,
  param,
  options,
  value,
  defaultValue,
  pathname,
  searchParams,
}: OptionGroupProps<Id>) {
  return (
    <div className="flex flex-col gap-0.25">
      <p className="leading-mono font-mono text-sm uppercase" id={`${param}-label`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-0.25" role="group" aria-labelledby={`${param}-label`}>
        {options.map((option) => {
          const active = option.id === value;
          const href = buildHref(pathname, searchParams, (params) => {
            if (option.id === defaultValue) params.delete(param);
            else params.set(param, option.id);
          });

          return (
            <AccentLink
              key={option.id}
              href={href}
              replace
              scroll={false}
              prefetch={false}
              aria-current={active ? 'true' : undefined}
              className={clsx(
                'rounded-full border px-0.75 py-0.25 font-mono text-xs leading-mono tracking-wide uppercase',
                active
                  ? 'border-charcoal bg-charcoal text-white'
                  : 'border-gray bg-white text-black hover:border-charcoal'
              )}
            >
              {option.label}
            </AccentLink>
          );
        })}
      </div>
    </div>
  );
}
