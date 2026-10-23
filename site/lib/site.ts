/**
 * Where the site is served. Metadata, the sitemap, robots, and the registry install snippets build their absolute URLs
 * from it. `scripts/build-registry` cannot import the site, so it keeps a copy as `REGISTRY_ORIGIN`; keep them equal.
 */
export const SITE_URL = 'https://skins.videojs.org';

/** The site's name: the wordmark, the default title, and the suffix of every other page title. */
export const SITE_NAME = 'Video.js Skins';

export const SITE_DESCRIPTION =
  'A catalog of community and recreated skins for Video.js 10, maintained by the Video.js team. Preview each skin, set your accent color, and add its source to your project with shadcn.';
