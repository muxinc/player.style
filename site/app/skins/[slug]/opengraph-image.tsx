import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/app/_components/og/renderOgImage';
import { getSkin, skins } from '@/lib/skins';

export const alt = 'A skin for Video.js on player.style';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return skins.map((skin) => ({ slug: skin.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skin = getSkin(slug);

  return renderOgImage(skin ? `${skin.title} skin for Video.js` : 'Skins for Video.js');
}
