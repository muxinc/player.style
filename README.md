# Video.js Skins

A catalog of community and recreated skins for [Video.js 10](https://videojs.org), maintained by the Video.js team. Preview each skin, set your accent color, and add its source to your project with [shadcn](https://ui.shadcn.com).

Visit [skins.videojs.org](https://skins.videojs.org).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The site shows them as cards that link to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected.

Community skins live under `skins/*`. Eight recreate the classic Media Chrome themes for Video.js 10 (YT, Sutro, Notflix, Vimeonova, Instaplay, Reelplay, Winamp, Sutro Audio). Each has an HTML version, a React version, and one shared stylesheet.

## Install

Skins install as source from a [shadcn registry](https://ui.shadcn.com/docs/registry) the site hosts, one catalog per framework. Point the `@skins` namespace at the React catalog (or the HTML one, `/r/html/{name}.json`) once, then add a skin:

```sh
npx shadcn@latest registry add @skins=https://skins.videojs.org/r/react/{name}.json
npx shadcn@latest add @skins/yt
```

That copies the skin's source files into `components/skins/yt/` and installs the pinned `@videojs/react` (or `@videojs/html`). Without a namespace, `npx shadcn@latest add https://skins.videojs.org/r/react/yt.json` does the same. The files are yours to edit. See [`scripts/build-registry`](scripts/build-registry/README.md) for the layout and item names.

See [`docs/skins.md`](docs/skins.md) for how a skin is built in this repository: layout, stylesheet rules, theming, the live video use case, tests, and site registration.

Want a skin listed? [Open an issue](https://github.com/muxinc/player.style/issues).

## Looking for player.style?

The Media Chrome-era player.style site is retired, and player.style redirects here. Its themes carry on as the recreated skins in this catalog; the old source stays on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome).

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the skins and then the site (`pnpm build:skins` builds the skins alone)
1. Run `pnpm lint` to lint and `pnpm format` to format
