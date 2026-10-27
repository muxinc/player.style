import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';
import { skins } from '@/lib/skins';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    ...skins.map((skin) => ({
      url: `${SITE_URL}/skins/${skin.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
