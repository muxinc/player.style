import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from './_components/og/renderOgImage';

export const alt = 'player.style – Skins for Video.js';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage('player.style — Skins for Video.js');
}
