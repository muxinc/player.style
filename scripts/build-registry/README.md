# build-registry

Builds the [shadcn registry](https://ui.shadcn.com/docs/registry) the player.style site hosts under `/r`, so a
project can pull a skin's source files into its own tree with the stock CLI instead of copying them from the site. The
commands have the shape Video.js 10 documents for its own skins (`registry add @videojs=…`, then `add @videojs/video`):

```sh
npx shadcn@latest registry add @player-style=https://player.style/r/react/{name}.json
npx shadcn@latest add @player-style/yt

# or, with no namespace set up:
npx shadcn@latest add https://player.style/r/react/yt.json
```

The registry is generated, never edited: `pnpm build:registry` reads every `skins/*/dist/open` (built by
`pnpm build:skins`, see `scripts/build-skin`) and writes `site/public/r/` (gitignored). Vercel runs it between
`build:skins` and `next build` (`site/vercel.json`); the root `pnpm build` does the same.

## Layout and URLs

Two catalogs, one per framework, mirroring how Video.js 10 splits its own registry. Every skin directory under
`skins/` with built source files (`dist/open`) yields one item **named after the directory** in both catalogs
(`yt`, `sutro-audio`, `microvideo-live`, …); a theme's video and live video use cases are separate packages and
therefore separate items. Video.js 10 names its items after the preset (`video`, `live-video`) and switches theme by
catalog URL (`/r/react/minimal`); with 21 skin packages a catalog per skin would make the namespace URL the skin picker, so
here the item name is the theme and the catalog is only the framework.

```
site/public/r/
  react/
    registry.json      the catalog, validated with shadcn's registrySchema (name "player.style")
    catalog.json       one entry per item, shaped like Video.js 10's (label, preset, media, live, component,
                       registryItem, directory) plus useCase, element, description, package, version, docs, url, files
    <item>.json        one per skin, what `shadcn add` fetches
  html/
    registry.json
    catalog.json
    <item>.json
```

| URL | What it is |
| --- | --- |
| `https://player.style/r/react/<item>.json` | React item: `Skin.tsx` + `skin.css`, installs `@videojs/react@<pin>` |
| `https://player.style/r/html/<item>.json` | HTML item: `skin.html` + `register.ts` + `skin.css`, installs `@videojs/html@<pin>` |
| `https://player.style/r/<framework>/catalog.json` | Array of catalog entries (see `CatalogEntry` in `index.ts`) |
| `https://player.style/r/<framework>/registry.json` | The whole catalog (items with file contents) |

The `<pin>` is the skin's exact peer range for that package (`10.0.0-rc.2` today), read from `skins/<name>/package.json`;
the build fails if a skin's peer is missing or not exact, or if two skins disagree.

## Items

Each item is a `registry:block` with:

- `name` (the skin directory), `title` (`registryItemTitle`: the catalog label plus ` Skin`, as Video.js 10's
  `Default Video Skin`; the label title-cases the slug, overrides `YT`, `X-mas` and `Video.js 1`/`4`/`8`, and spells `-live` as ` Live`),
  `description` and `author` from the package's `package.json`, and `categories` `['media', 'skins', <preset>]`.
- `docs`, which the CLI prints after `add`: the pinned requirement, a link to the Video.js docs on playback adapters,
  the skin's page, and a code block using the installed files through the `@/` alias (React: the player, the skin
  component and `skin.css`; HTML: the three imports and the `<preset-player>` to paste `skin.html` into). Video.js 10's
  React items print the same kind of block.
- `meta`: `role: 'skin'`, `framework`, `styling: 'css'`, `preset`, `useCase` (the same id: `video`, `audio`,
  `live-video`, `live-audio`), `media`, `package`, `version`, and `component` (React) or `element` (HTML). The first
  six keys are Video.js 10's.
- `dependencies: ['@videojs/react@<pin>', 'react']` or `['@videojs/html@<pin>']`, as Video.js 10's items list them.
  Unlike Video.js 10's React skins there are no `registryDependencies`: a skin composes the `@videojs/react` and
  `@videojs/html` primitives from npm instead of copying them, so one item is the whole skin, and the no-namespace URL
  form below works (Video.js 10's does not: its items reference `@videojs/...` dependencies by namespace).
- `files`, each with an explicit target so the layout is the same in every project:

| Catalog | File | Type | Target |
| --- | --- | --- | --- |
| react | `Skin.tsx` | `registry:component` | `@components/player-style/<item>/Skin.tsx` |
| react | `skin.css` | `registry:file` | `@components/player-style/<item>/skin.css` |
| html | `skin.html` | `registry:file` | `@components/player-style/<item>/skin.html` |
| html | `register.ts` | `registry:file` | `@components/player-style/<item>/register.ts` |
| html | `skin.css` | `registry:file` | `@components/player-style/<item>/skin.css` |

`@components/` is shadcn's placeholder for the project's `aliases.components` (`components.json`), so the files land
in `src/components/player-style/<item>/` in a Vite project with `@/*` mapped to `./src/*`, and in
`components/player-style/<item>/` in a Next app. Video.js 10 uses the same mechanism (`@components/videojs/<preset>`).
The alternative, `~/components/...`, would ignore the alias and miss `src/`. `Skin.tsx` is `registry:component`, as
Video.js 10's `skin.tsx`; everything else is `registry:file`. Video.js 10 types its `skin.css` as `registry:style`, but
shadcn 4.21 runs that type through its CSS pass, which drops a stylesheet's leading comment (every skin's header).
With an explicit target the CLI writes each file verbatim: the contents are the source files byte for byte,
`'use client'` included (shadcn 4.21 keeps it with `rsc: false`), and the `@videojs/*` imports are not rewritten.
Nothing is injected into the project's own stylesheet; the skin's styles are `skin.css`, which the usage imports. That
is the one step Video.js 10's files spare the user (its `skin.tsx` and `skin.ts` import `./skin.css` themselves), and
it lives in the source files `scripts/build-skin` emits, not here.

## Namespace

A shadcn namespace maps to one URL template with a `{name}` placeholder, so one namespace can serve one catalog at a
time. The site documents `@player-style` pointed at the framework the visitor picked:

```json
{
  "registries": {
    "@player-style": "https://player.style/r/react/{name}.json"
  }
}
```

(or `/r/html/{name}.json`), written by `shadcn registry add @player-style=<url>`, exactly as Video.js 10 does with
`@videojs`. A project that wants both catalogs can add a second namespace (`@player-style-html`) by hand; the item
names are identical, so nothing else changes. Encoding the framework in the item name (`yt-html`) was rejected because
it breaks the symmetry with v10's catalogs and the site already selects a framework. The full-URL form
(`shadcn add https://player.style/r/html/yt.json`) needs no namespace at all.

`site/lib/registry.ts` holds the same constants and command builders for the site UI.

## Minimal `components.json`

Video.js 10's docs tell a project without `components.json` to run `shadcn init`, which needs Tailwind and a React
framework: it stops at "No Tailwind CSS configuration found" in a Vite React app without Tailwind and at "We could not
detect a supported framework" in a Vite vanilla-TS app, so the Vanilla CSS and HTML paths have no documented way in.
A project here needs only the aliases, resolved through its tsconfig `paths`, and a stylesheet path; nothing
Tailwind-specific is read for these items:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "aliases": { "components": "@/components", "ui": "@/components/ui", "lib": "@/lib", "utils": "@/lib/utils", "hooks": "@/hooks" },
  "registries": { "@player-style": "https://player.style/r/react/{name}.json" }
}
```

Keep `cssVariables: true`: with `false` the CLI runs its colour-mapping pass over every JSX string literal in a
`.tsx` file, splitting on spaces and deduplicating tokens, which turns `viewBox="0 0 24 24"` into `"0 24"` and breaks
every inline SVG in a skin. Pair it with `"paths": { "@/*": ["./src/*"] }` under `compilerOptions` in `tsconfig.json`
(and `tsconfig.app.json` in the Vite React scaffold, whose root `tsconfig.json` only holds project references). Leave
out `baseUrl`: TypeScript 6, which `create-vite` scaffolds today, deprecates it and `tsc -b` fails with TS5101, while
`paths` alone resolves for both TypeScript and the CLI. The e2e below (`pnpm -F build-registry e2e`) exercises these
settings against fresh Vite projects.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm build:registry` (root) / `pnpm -F build-registry build` | Stages each catalog under `scripts/build-registry/dist/<framework>/`, runs `shadcn build` on it, writes `catalog.json`, validates every hosted file. `node build.ts <dir>` writes elsewhere. |
| `pnpm -F build-registry test` | Unit tests for item construction (`tests/items.test.ts`) and the real build over the built skins into a scratch directory, validating every emitted JSON (`tests/build.test.ts`). Needs `pnpm build:skins` first; a skin without `dist/open` is skipped and named in the build output. |
| `pnpm -F build-registry typecheck` | `tsc` over the package. |
| `pnpm -F build-registry e2e` | `e2e/run.mjs`: fresh Vite React and Vite vanilla-TS projects, `shadcn add` against a local server for `site/public/r`, a Vite build, and a screenshot of each (`REGISTRY_E2E_DIR`, `REGISTRY_E2E_ITEM=yt`). Needs the network and Playwright's Chromium (`e2e/browser.mjs` launches it); not wired into CI yet. |

The build runs on Node's built-in TypeScript support (`node build.ts`), so the package's sources use only erasable
syntax and explicit `.ts` import specifiers.
