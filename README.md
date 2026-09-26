# player.style

A gallery of first- and third-party skins for [Video.js 10](https://videojs.org). Preview every skin, set your accent color, and install it in React, HTML, Vue, Svelte, or from the CDN.

Visit [player.style](https://player.style).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The gallery lists the default and minimal skins for video, audio, live video, and live audio, and links each one to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected.

Third-party skins live under `skins/*`. All 14 classic player.style themes (YT, Sutro, Essentials (formerly Minimal), Notflix, Vimeonova, Instaplay, Microvideo, Reelplay, Demuxed 2022, Halloween, X-mas, Winamp, Sutro Audio, Tailwind Audio) are ported to Video.js 10 as `@player.style/<name>` 1.x packages, each with an HTML custom element, a React component, one shared stylesheet, and its source files under `dist/open` to copy into your own tree. Four of them (Essentials, Microvideo, Demuxed 2022, X-mas) also serve the live video use case through a sibling package, `@player.style/<name>-live`. Four more packages recreate Video.js’s own historical default skins for video: Video.js 1 (the 2010 original, `@player.style/videojs-1`), Video.js 3 (the 2011 glossy black bar, `@player.style/videojs-3`), Video.js 4 (the 2013 redesign, `@player.style/videojs-4`), and Video.js 8 (the design Video.js shipped from 5.0 through 8.x, `@player.style/videojs-8`); Video.js 4 and 8 also serve live video through `@player.style/videojs-4-live` and `@player.style/videojs-8-live`. Others recreate the default looks of other web players: Plyr (`@player.style/plyr`), Vidstack (`@player.style/vidstack`), Media Chrome’s unthemed components (`@player.style/media-chrome`), and Mux Player’s Gerwig and Classic themes (`@player.style/mux-player`, `@player.style/mux-player-classic`); all but Plyr also serve live video through their `-live` sibling. The root `player.style` package re-exports every skin as `player.style/<name>/html`, `player.style/<name>/react`, and `player.style/<name>/skin.css`; there is no bare `player.style/<name>` entry, so neither framework reads as the default. The 1.x alphas publish under the `next` dist-tag; `latest` moves to 1.x when Video.js 10 is GA (see [Root package and releases](docs/skins.md#root-package-and-releases)).

The source files are also a [shadcn registry](https://ui.shadcn.com/docs/registry) hosted by the site. Point the `@player-style` namespace at the React or HTML catalog once (`npx shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json`, or `/r/html/{name}.json`), then `npx shadcn@latest add @player-style/yt` copies the skin's source files into `components/player-style/yt/` and installs the pinned `@videojs/react` (or `@videojs/html`). Without a namespace, `npx shadcn@latest add https://player.style/r/react/yt.json` does the same. Copying the files from the skin's page still works; see [`scripts/build-registry`](scripts/build-registry/README.md) for the layout and item names.

See [`docs/skins.md`](docs/skins.md) for how to add a skin package: layout, stylesheet rules, theming, the live video use case, tests, site registration, and releases.

## Looking for the Media Chrome themes?

The original player.style collection of [Media Chrome](https://media-chrome.org) themes lives on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome), is published as `player.style@media-chrome` on npm, and will stay available at [media-chrome.player.style](https://media-chrome.player.style). 0.x fixes ship from that branch under the `media-chrome` dist-tag.

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the skins and then the site (`pnpm build:skins` builds the skins alone)
1. Run `pnpm lint` to lint and `pnpm format` to format

The apps under [`examples/`](examples) consume the built skin packages as a user would; `pnpm build:examples` builds them as a packaging smoke test, and `pnpm -F example-sandbox dev` opens a sandbox that renders any skin as its React component or its HTML element (see [Examples](docs/skins.md#examples)).
