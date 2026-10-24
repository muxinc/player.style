/**
 * Where the site is served: the origin the registry is hosted on. Metadata, the sitemap, robots, and the registry
 * install snippets build their absolute URLs from it.
 */
export { REGISTRY_ORIGIN as SITE_URL } from 'build-registry/names';

/** The site's name: the wordmark, the default title, and the suffix of every other page title. */
export const SITE_NAME = 'Video.js Skins';

export const SITE_DESCRIPTION =
  'A catalog of community and recreated skins for Video.js 10, maintained by the Video.js team. Preview each skin, set your accent color, and add its source to your project with shadcn.';
