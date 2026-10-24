export const GITHUB_URL = 'https://github.com/muxinc/player.style';
/** Where to ask for a skin to be listed. */
export const ISSUES_URL = `${GITHUB_URL}/issues`;
export const VIDEOJS_URL = 'https://videojs.org';
export const VIDEOJS_DOCS_URL = 'https://videojs.org/docs';

export const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: '/', label: 'Skins' },
  { href: '/about', label: 'About' },
  { href: VIDEOJS_DOCS_URL, label: 'Video.js docs', external: true },
];
