import { SITE_NAME } from '@/lib/site';

import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from './_components/og/renderOgImage';

export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  // The Video.js wordmark sits above the title, so the two together read as the site's name.
  return renderOgImage('Skins');
}
