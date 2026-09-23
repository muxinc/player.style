import type { NextConfig } from 'next';

// The legacy Media Chrome theme gallery lives on the `media-chrome` branch and is deployed as media-chrome.player.style.
// Old theme links keep working by bouncing there; the redirects are temporary so the URLs stay ours.
const MEDIA_CHROME_ORIGIN = 'https://media-chrome.player.style';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/themes', destination: MEDIA_CHROME_ORIGIN, permanent: false },
      { source: '/themes/:slug*', destination: `${MEDIA_CHROME_ORIGIN}/themes/:slug*`, permanent: false },
    ];
  },
};

export default nextConfig;
