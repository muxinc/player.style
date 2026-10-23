import type { NextConfig } from 'next';

import { getThirdPartyPackage, isThirdPartySkin, skins } from './lib/skins';

// A skin's live video package once had its own card and page, `/skins/<name>-live`; it now shares the skin's page.
const liveSkinRedirects = skins.filter(isThirdPartySkin).flatMap((skin) =>
  skin.useCases.slice(1).map((useCase) => ({
    source: `/skins/${getThirdPartyPackage(skin, useCase).name}`,
    destination: `/skins/${skin.slug}?use-case=${useCase}`,
    permanent: true,
  }))
);

// The Media Chrome-era gallery is retired and player.style redirects here. Its theme pages land on the skin that
// recreates the theme; its other pages (players, features, demo) have no counterpart and are not redirected.
const legacyThemeRedirects = [
  { source: '/themes', destination: '/', permanent: true },
  ...skins
    .filter(isThirdPartySkin)
    .flatMap((skin) =>
      skin.legacy
        ? [{ source: `/themes/${skin.legacy.theme}`, destination: `/skins/${skin.slug}`, permanent: true }]
        : []
    ),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [...liveSkinRedirects, ...legacyThemeRedirects];
  },
};

export default nextConfig;
