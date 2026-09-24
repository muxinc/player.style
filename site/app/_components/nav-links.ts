export const GITHUB_URL = 'https://github.com/muxinc/player.style';
/** The guide to adding a third-party skin package, where a would-be contributor starts. */
export const SKIN_GUIDE_URL = `${GITHUB_URL}/blob/main/docs/skins.md`;
export const VIDEOJS_URL = 'https://videojs.org';
export const VIDEOJS_DOCS_URL = 'https://videojs.org/docs';
export const MUX_URL = 'https://mux.link/player-style';

export const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Skins' },
  { href: '/about', label: 'About' },
  { href: VIDEOJS_DOCS_URL, label: 'Video.js docs', external: true },
];
