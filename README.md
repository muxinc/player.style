# Video.js Skins

A catalog of community and recreated skins for [Video.js 10](https://videojs.org), maintained by the Video.js team. Preview each skin, set your accent color, and add its source to your project with [shadcn](https://ui.shadcn.com).

Visit [skins.videojs.org](https://skins.videojs.org).

## Skins

First-party skins are built by the Video.js team and ship inside `@videojs/html` and `@videojs/react`. The site shows them as cards that link to the [Video.js installation guide](https://videojs.org/docs/guides/installation/react) with the right options pre-selected.

Community skins live under `skins/<name>/`, each a [`skin create`](https://videojs.org) project per framework (`react/`, `html/`) taken in with `scripts/add-skin`. Eight recreate the classic Media Chrome themes for Video.js 10: YT, Sutro, Notflix, Vimeonova, Instaplay, Reelplay, Winamp and Sutro Audio.

## Install

Skins install as source from a [shadcn registry](https://ui.shadcn.com/docs/registry) the site hosts, one catalog per framework. Point the `@skins` namespace at the React catalog (or the HTML one, `/r/html/{name}.json`) once, then add a skin:

```sh
npx shadcn@latest registry add @skins=https://skins.videojs.org/r/react/{name}.json
npx shadcn@latest add @skins/winamp
```

That copies the skin's source files into `components/skins/winamp/` and installs the pinned `@videojs/react` (or `@videojs/html`). Without a namespace, `npx shadcn@latest add https://skins.videojs.org/r/react/winamp.json` does the same. The files are yours to edit. See [`scripts/build-registry`](scripts/build-registry/README.md) for the layout and item names.

See [`docs/skins.md`](docs/skins.md) for how a skin gets here: the layout, the intake script, `catalog.json`, and the checks it passes.

Want a skin listed? [Open an issue](https://github.com/muxinc/player.style/issues).

## Looking for player.style?

The Media Chrome-era player.style site is retired, and player.style redirects here. Its themes carry on as the recreated skins in this catalog; the old source stays on the [`media-chrome` branch](https://github.com/muxinc/player.style/tree/media-chrome).

## Local development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up). The workspace builds every skin against one Video.js release, pinned in the `pnpm-workspace.yaml` catalog.

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm build:skins`, then `pnpm dev` to start the site (it lists the skins that are built)
1. Run `pnpm build` to build the skins, the registry and the site
1. Run `pnpm test` for the unit tests and the phone fit check (Chromium from `playwright-core`; see `scripts/fit-check`)
1. Run `pnpm lint` to lint and `pnpm format` to format

The site deploys on Netlify from [`netlify.toml`](netlify.toml): it runs `pnpm build` at the repository root and serves the Next.js app with Netlify's Next.js runtime.

To add a skin: `node scripts/add-skin/add-skin.ts <skin create project> --name <slug> --owner <github-user>` (see [`docs/skins.md`](docs/skins.md)).
