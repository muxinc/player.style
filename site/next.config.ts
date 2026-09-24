import type { NextConfig } from 'next';

import { getThirdPartyPackage, isThirdPartySkin, skins } from './lib/skins';

// The legacy Media Chrome theme gallery lives on the `media-chrome` branch and is deployed as media-chrome.player.style.
// Old theme, player, feature, and demo links keep working by bouncing there; the redirects are temporary so the URLs
// stay ours.
const MEDIA_CHROME_ORIGIN = 'https://media-chrome.player.style';

// A skin's live video package once had its own card and page, `/skins/<name>-live`; it now shares the skin's page.
const liveSkinRedirects = skins.filter(isThirdPartySkin).flatMap((skin) =>
  skin.useCases.slice(1).map((useCase) => ({
    source: `/skins/${getThirdPartyPackage(skin, useCase).name}`,
    destination: `/skins/${skin.slug}?use-case=${useCase}`,
    permanent: true,
  }))
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      // `import files from '@player.style/<name>/open/skin.html?open'` bundles a skin's open edition as text.
      '*.html': {
        condition: { query: /^\?open$/ },
        loaders: ['./lib/build/open-edition-loader.cjs'],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return [
      ...liveSkinRedirects,
      { source: '/themes', destination: MEDIA_CHROME_ORIGIN, permanent: false },
      { source: '/themes/:slug*', destination: `${MEDIA_CHROME_ORIGIN}/themes/:slug*`, permanent: false },
      { source: '/players/:path*', destination: `${MEDIA_CHROME_ORIGIN}/players/:path*`, permanent: false },
      { source: '/features/:path*', destination: `${MEDIA_CHROME_ORIGIN}/features/:path*`, permanent: false },
      { source: '/demo', destination: `${MEDIA_CHROME_ORIGIN}/demo`, permanent: false },
    ];
  },
};

export default nextConfig;
