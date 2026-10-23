# player.style

A gallery of first- and third-party skins for [Video.js 10](https://videojs.org). Preview every skin, set your accent color, and install it in React, HTML, Vue, Svelte, or from the CDN.

Visit [player.style](https://player.style).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The gallery lists the default and minimal skins for video, audio, live video, and live audio, and links each one to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected.

Third-party skins live under `skins/*`. Eight classic player.style themes (YT, Sutro, Notflix, Vimeonova, Instaplay, Reelplay, Winamp, Sutro Audio) are ported to Video.js 10 as `@player.style/<name>` 1.x packages, each with an HTML custom element, a React component, one shared stylesheet, and its source files under `dist/open` to copy into your own tree.

The source files are also a [shadcn registry](https://ui.shadcn.com/docs/registry) hosted by the site. Point the `@player-style` namespace at the React or HTML catalog once (`npx shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json`, or `/r/html/{name}.json`), then `npx shadcn@latest add @player-style/yt` copies the skin's source files into `components/player-style/yt/` and installs the pinned `@videojs/react` (or `@videojs/html`). Without a namespace, `npx shadcn@latest add https://player.style/r/react/yt.json` does the same. Copying the files from the skin's page still works; see [`scripts/build-registry`](scripts/build-registry/README.md) for the layout and item names.

See [`docs/skins.md`](docs/skins.md) for how to add a skin package: layout, stylesheet rules, theming, the live video use case, tests, site registration, and publishing.

## Looking for the Media Chrome themes?

The original player.style collection of [Media Chrome](https://media-chrome.org) themes lives on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome) and will stay available at [media-chrome.player.style](https://media-chrome.player.style).

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the skins and then the site (`pnpm build:skins` builds the skins alone)
1. Run `pnpm lint` to lint and `pnpm format` to format

The apps under [`examples/`](examples) consume the built skin packages as a user would; `pnpm build:examples` builds them as a packaging smoke test, and `pnpm -F example-sandbox dev` opens a sandbox that renders any skin as its React component or its HTML element (see [Examples](docs/skins.md#examples)).
