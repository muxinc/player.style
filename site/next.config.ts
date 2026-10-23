import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { NextConfig } from 'next';

// The repository root: the site reads the skins under `../skins` (`lib/skins.ts`, `lib/skin-builds.ts`) through
// `import.meta.glob`, which Turbopack resolves only inside its root.
const root = path.join(import.meta.dirname, '..');
const skinsDir = path.join(root, 'skins');

// The Media Chrome-era gallery is retired and player.style redirects here. Its theme pages land on the skin that
// recreates the theme (`legacyTheme` in the skin's catalog.json, or its own name); its other pages (players, features,
// demo) have no counterpart and are not redirected. `lib/skins.ts` cannot be imported here: Node has no
// `import.meta.glob`, so the catalogs are read directly.
const legacyThemeRedirects = [
  { source: '/themes', destination: '/', permanent: true },
  ...readdirSync(skinsDir).flatMap((name) => {
    const file = path.join(skinsDir, name, 'catalog.json');
    if (!existsSync(file)) return [];

    const { legacyTheme } = JSON.parse(readFileSync(file, 'utf8')) as { legacyTheme?: string };

    return legacyTheme ? [{ source: `/themes/${legacyTheme}`, destination: `/skins/${name}`, permanent: true }] : [];
  }),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root },
  outputFileTracingRoot: root,
  async redirects() {
    return [
      // A skin's live video package once had its own page, `/skins/<name>-live`; it is now a use case of the skin's.
      { source: '/skins/:slug([a-z0-9-]+)-live', destination: '/skins/:slug?use-case=live-video', permanent: true },
      // Video.js 10 renamed its minimal skins neutral.
      { source: '/skins/minimal-:rest([a-z-]+)', destination: '/skins/neutral-:rest', permanent: true },
      ...legacyThemeRedirects,
    ];
  },
};

export default nextConfig;
