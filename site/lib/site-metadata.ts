import type { Metadata } from 'next';

/*
 * Next replaces nested `openGraph` and `twitter` objects wholesale, so every page that sets its own spreads these in.
 * The images come from the `opengraph-image.tsx` files beside each route (file-based metadata outranks these fields),
 * rendered by `app/_components/og/renderOgImage.tsx`; nothing here needs to point at a static file.
 */
export const baseOpenGraph = {
  type: 'website',
  locale: 'en-US',
} satisfies NonNullable<Metadata['openGraph']>;

export const baseTwitter = {
  card: 'summary_large_image',
  site: '@muxhq',
} satisfies NonNullable<Metadata['twitter']>;
