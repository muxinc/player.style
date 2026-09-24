import clsx from 'clsx';
import type { ReactNode } from 'react';

import { buildHref, type SearchParamsInput } from '@/lib/search-params';

import AccentLink from './AccentLink';
import CheckIcon from './icons/CheckIcon';
import { cardFocusRing } from './ui';

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
  /** The badge shown in each card's media tile. */
  media?: (id: Id) => ReactNode;
  /** Each option's link, when choosing it changes more than its own param. */
  hrefFor?: (id: Id) => string;
  /** The narrowest a tile gets before the grid drops a column; short labels can go narrower than the default. */
  minTileWidth?: string;
};

/**
 * Card-radio tiles that each set the search param to one option, so every combination is a crawlable URL. Styled after
 * the Video.js 10 installation pickers: the chosen card carries the accent ring and a check badge.
 */
export default function OptionGroup<Id extends string>({
  label,
  param,
  options,
  value,
  defaultValue,
  pathname,
  searchParams,
  media,
  hrefFor,
  minTileWidth = '11rem',
}: OptionGroupProps<Id>) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-h4 uppercase" id={`${param}-label`}>
        {label}
      </p>
      <div
        className="grid auto-rows-fr gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minTileWidth}), 1fr))` }}
        role="group"
        aria-labelledby={`${param}-label`}
      >
        {options.map((option) => {
          const active = option.id === value;
          const href =
            hrefFor?.(option.id) ??
            buildHref(pathname, searchParams, (params) => {
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
                'group relative flex min-w-0 cursor-pointer items-center gap-3 rounded-xl corner-squircle border bg-surface p-3 text-left transition duration-150 ease-out select-none',
                'intent:-translate-y-0.5 intent:shadow-md motion-reduce:intent:translate-y-0',
                cardFocusRing,
                active
                  ? 'border-accent bg-surface-raised shadow-sm ring-1 ring-accent'
                  : 'border-line intent:border-line-strong'
              )}
            >
              {media && (
                <span
                  aria-hidden="true"
                  className="corner-squircle border-line bg-surface-raised text-faded-black dark:bg-faded-black dark:text-manila-light flex size-10 shrink-0 items-center justify-center rounded-lg border"
                >
                  {media(option.id)}
                </span>
              )}
              <span className="text-p3 block min-w-0 flex-1 pr-6 leading-tight font-semibold text-balance">
                {option.label}
              </span>
              <span
                aria-hidden="true"
                className={clsx(
                  'absolute top-2 right-2 flex size-5 items-center justify-center rounded-full border transition',
                  active
                    ? 'scale-100 border-accent bg-accent text-manila-light opacity-100'
                    : 'scale-75 border-line-strong bg-transparent text-transparent opacity-0 group-intent:opacity-100'
                )}
              >
                <CheckIcon className="size-4" />
              </span>
            </AccentLink>
          );
        })}
      </div>
    </div>
  );
}
