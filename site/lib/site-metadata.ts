import type { Metadata } from 'next';

// Next replaces nested `openGraph` and `twitter` objects wholesale, so every page that sets its own spreads these in.
const image = { url: '/player.style@2x.png', alt: 'player.style logo' };

export const baseOpenGraph = {
  type: 'website',
  locale: 'en-US',
  images: image,
} satisfies NonNullable<Metadata['openGraph']>;

export const baseTwitter = {
  card: 'summary_large_image',
  site: '@muxhq',
  images: image,
} satisfies NonNullable<Metadata['twitter']>;
