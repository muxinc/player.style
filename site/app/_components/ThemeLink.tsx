'use client';

import clsx from 'clsx';
import type { Theme } from 'content-collections';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UrlObject } from 'url';

type Props = {
  className?: string;
  theme: Theme;
};

/**
 * Persists primary-color, secondary-color, and accent-color across navigations
 */
export default function ThemeLink({ className, theme }: Props) {
  const searchParams = useSearchParams();

  let query: UrlObject['query'] = {};

  const primaryColor = searchParams.get('primary-color');
  if (primaryColor) query['primary-color'] = primaryColor;

  const secondaryColor = searchParams.get('secondary-color');
  if (secondaryColor) query['secondary-color'] = secondaryColor;

  const accentColor = searchParams.get('accent-color');
  if (accentColor) query['accent-color'] = accentColor;

  return (
    <Link
      href={{ pathname: `/themes/${theme._meta.path}`, query }}
      className={clsx('group cursor-pointer flex items-center justify-between gap-0.5', className)}
    >
      <h2 className="text-xl md:text-4xl leading-heading font-bold [text-wrap:balance] underline-offset-heading decoration-link group-hover:underline group-focus-visible:underline">
        {theme.title}
      </h2>
      <div className="px-0.5 py-0.25 rounded-4 font-mono leading-mono tracking-wide text-xs uppercase bg-putty-light border border-ctx group-hover:bg-blue group-hover:text-white group-hover:border-blue-dark group-focus-visible:bg-blue group-focus-visible:text-white group-focus-visible:border-blue-dark">
        More details
      </div>
    </Link>
  );
}
