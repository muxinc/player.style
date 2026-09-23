# player.style

A gallery of first- and third-party skins for [Video.js 10](https://videojs.org). Preview every skin, set your accent color, and install it in React, HTML, Vue, Svelte, or from the CDN.

Visit [player.style](https://player.style).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The gallery lists the default and minimal skins for video, audio, live video, and live audio, and links each one to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected. Third-party skin listings are coming next.

## Looking for the Media Chrome themes?

The original player.style collection of [Media Chrome](https://media-chrome.org) themes lives on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome), is published as `player.style@media-chrome` on npm, and will stay available at [media-chrome.player.style](https://media-chrome.player.style). The theme sources under `themes/` in this branch are kept for reference while they are ported to Video.js 10; they are no longer built by the site.

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the site
1. Run `pnpm lint` to lint and `pnpm format` to format

The archived themes under `themes/` can still be built with `pnpm build:themes` when publishing a `media-chrome` release.
