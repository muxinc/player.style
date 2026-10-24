/*
 * The `?accent=` param, apart from the other search params: the accent hooks run in every page's client components, and
 * `search-params.ts` imports the skin list.
 */

export const ACCENT_PARAM = 'accent';

const HEX_COLOR = /^[0-9a-f]{6}$/i;

/** A six-digit hex accent without the `#`, as carried in `?accent=`. */
export function parseAccent(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const hex = value.replace(/^#/, '').toLowerCase();

  return HEX_COLOR.test(hex) ? hex : undefined;
}

/** An internal href with `?accent=` set to the given accent, or removed when there is none. */
export function withAccent(href: string, accent: string | undefined): string {
  const [pathname = '', query] = href.split('?');
  const params = new URLSearchParams(query);

  if (accent) params.set(ACCENT_PARAM, accent);
  else params.delete(ACCENT_PARAM);

  const search = params.toString();

  return search ? `${pathname}?${search}` : pathname;
}
