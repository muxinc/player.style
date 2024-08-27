'use client';

import type { Theme } from 'content-collections';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UrlObject } from 'url';

type Props = {
  theme: Theme;
};

/**
 * Persists primary-color, secondary-color, and accent-color across navigations
 */
export default function ThemeLink({ theme }: Props) {
  const searchParams = useSearchParams();

  let query: UrlObject['query'] = {};

  const primaryColor = searchParams.get('primary-color');
  if (primaryColor) query['primary-color'] = primaryColor;

  const secondaryColor = searchParams.get('secondary-color');
  if (secondaryColor) query['secondary-color'] = secondaryColor;

  const accentColor = searchParams.get('accent-color');
  if (accentColor) query['accent-color'] = accentColor;

  return <Link href={{ pathname: `/themes/${theme._meta.path}`, query }}>{theme.title}</Link>;
}
