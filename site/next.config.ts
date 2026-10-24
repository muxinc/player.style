import path from 'node:path';

import type { NextConfig } from 'next';

// The repository root: the site reads the skins under `../skins` (`lib/skins.ts`, `lib/skin-builds.ts`) through
// `import.meta.glob`, which Turbopack resolves only inside its root.
const root = path.join(import.meta.dirname, '..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root },
  outputFileTracingRoot: root,
  async redirects() {
    return [
      // The first-party live skins' pages are `<tier>-live-video`; the generic rule below would send these to a 404.
      { source: '/skins/:tier(default|neutral)-live', destination: '/skins/:tier-live-video', permanent: true },
      // A skin's live video package once had its own page, `/skins/<name>-live`; it is now a use case of the skin's. The
      // skin page falls back to its default use case when the skin has no live video.
      { source: '/skins/:slug([a-z0-9-]+)-live', destination: '/skins/:slug?use-case=live-video', permanent: true },
      // Video.js 10 renamed its minimal skins neutral.
      { source: '/skins/minimal-:rest([a-z-]+)', destination: '/skins/neutral-:rest', permanent: true },
      // The Media Chrome-era gallery is retired and player.style redirects here. Each recreated theme kept its name as
      // its skin's slug; a theme with no skin lands on the 404. Its other pages (players, features, demo) have no
      // counterpart and are not redirected.
      { source: '/themes', destination: '/', permanent: true },
      { source: '/themes/:slug', destination: '/skins/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
