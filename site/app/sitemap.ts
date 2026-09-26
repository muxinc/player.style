import type { MetadataRoute } from 'next';

import { skins } from '@/lib/skins';

const BASE_URL = 'https://player.style';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: BASE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    ...skins.map((skin) => ({
      url: `${BASE_URL}/skins/${skin.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
