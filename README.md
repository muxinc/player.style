# player.style

A gallery of first- and third-party skins for [Video.js 10](https://videojs.org). Preview every skin, set your accent color, and install it in React, HTML, Vue, Svelte, or from the CDN.

Visit [player.style](https://player.style).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The gallery lists the default and minimal skins for video, audio, live video, and live audio, and links each one to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected.

Third-party skins live under `skins/*`. All 14 classic player.style themes (YT, Sutro, Essentials (formerly Minimal), Notflix, Vimeonova, Instaplay, Microvideo, Reelplay, Demuxed 2022, Halloween, X-mas, Winamp, Sutro Audio, Tailwind Audio) are ported to Video.js 10 as `@player.style/<name>` 1.x packages, each with an HTML custom element, a React component, one shared stylesheet, and an open edition under `dist/open` to copy into your own tree. The root `player.style` package re-exports every skin as `player.style/<name>`, `player.style/<name>/react`, and `player.style/<name>/skin.css`. The 1.x alphas publish under the `next` dist-tag; `latest` moves to 1.x when Video.js 10 is GA (see [Publishing](docs/porting/README.md#publishing)).

See [`docs/porting/README.md`](docs/porting/README.md) for how a theme is ported, [`docs/porting/friction-log.md`](docs/porting/friction-log.md) for what the ports found (per-skin status and the Video.js 10 gaps worth filing upstream), and [`apps/skin-compare`](apps/skin-compare) for the side-by-side harness.

## Looking for the Media Chrome themes?

The original player.style collection of [Media Chrome](https://media-chrome.org) themes lives on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome), is published as `player.style@media-chrome` on npm, and will stay available at [media-chrome.player.style](https://media-chrome.player.style). 0.x fixes ship from that branch under the `media-chrome` dist-tag.

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the skins and then the site (`pnpm build:skins` builds the skins alone)
1. Run `pnpm lint` to lint and `pnpm format` to format
1. Run `pnpm compare:skin <name>` to capture a skin next to its Media Chrome original
