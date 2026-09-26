'use client';

import { useSearchParams } from 'next/navigation';

import { ACCENT_PARAM, parseAccent, withAccent } from '@/lib/search-params';

/**
 * The live `?accent=`. The accent picker writes it with `history.replaceState`, which Next syncs into
 * `useSearchParams`, so everything reading it follows the picker without a server round trip. Dynamic pages render
 * with the request's params, so the server HTML already carries the accent.
 */
export function useAccent(): string | undefined {
  return parseAccent(useSearchParams().get(ACCENT_PARAM));
}

/** An internal href carrying the live accent. */
export function useAccentHref(href: string): string {
  return withAccent(href, useAccent());
}
