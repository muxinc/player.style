# build-registry

Builds the [shadcn registry](https://ui.shadcn.com/docs/registry) the Video.js Skins site hosts under `/r`, so a
project can pull a skin's source files into its own tree with the stock CLI instead of copying them from the site. The
commands have the shape Video.js 10 documents for its own skins (`registry add @videojs=…`, then `add @videojs/video`):

```sh
npx shadcn@latest registry add @skins=https://skins.videojs.org/r/react/{name}.json
npx shadcn@latest add @skins/winamp

# or, with no namespace set up:
npx shadcn@latest add https://skins.videojs.org/r/react/winamp.json
```

The registry is generated, never edited: `pnpm build:registry` reads every skin package's sources
(`skins/<name>/<framework>/src/`, `skin.json`, `package.json`, and `skins/<name>/catalog.json`) and writes
`site/public/r/` (gitignored). It needs no build of the skins. A `skins/*` folder still in the old one-package layout
is skipped and named in the output. Vercel runs it before `next build` (`site/vercel.json`); the root `pnpm build`
does the same.

## Layout and URLs

Two catalogs, one per framework, mirroring how Video.js 10 splits its own registry. A skin that ships one framework
appears only in that catalog. Each package yields **one item per preset folder**: the skin's default preset (its first
of `video`, `audio`, `live-video`, `live-audio` across both frameworks) is `<name>`, its live twin `<name>-live`, any
other preset `<name>-<preset>`.

```
site/public/r/
  react/
    registry.json      the catalog, validated with shadcn's registrySchema (name "skins")
    catalog.json       one entry per item, shaped like Video.js 10's (label, preset, media, live, component,
                       registryItem, directory) plus useCase, player (HTML), description, docs, url, files
    <item>.json        what `shadcn add` fetches
  html/
    registry.json
    catalog.json
    <item>.json
```

## Items

Each item is a `registry:block` with:

- `name` as above; `title` (`<label> Skin`, the label being `catalog.json`'s `title`, plus `Live` or the preset for a
  non-default preset); `description` and `author` from `catalog.json`; `categories` `['media', 'skins', <preset>]`.
- `files`: everything under the package's `src/` except other presets' folders, so shared `styles/`, `lib/` and `ui/`
  go into every preset's item (installing two writes the same files twice). A CSS skin's `src/skin.css` is
  `skin create`'s preview-only sheet and stays out; a Tailwind skin's is its Tailwind entry (`@source`, `@theme`) and
  goes in. Each file targets `@components/skins/<name>/<path under src>`, so every preset installs into one folder laid
  out like the `skin create` project. React `.ts`/`.tsx` files are `registry:component`; everything else (markup,
  CSS, HTML `skin.ts`) is `registry:file`, which shadcn writes verbatim, as Video.js 10 types its HTML skins' files.
- Imports rewritten for that folder: the project's `'@/` becomes `'@/components/skins/<name>/` (the reverse of
  `skin create`'s rewrite of `@/components/videojs/`). shadcn then maps `@/components/` onto the consumer's alias.
- `dependencies`: the names in the package's `dependencies` and `peerDependencies`, with every `@videojs/*` pinned to
  `skin.json`'s `videojs` and the rest unversioned (`["@videojs/react@10.2.0", "react"]` for Winamp). The build fails
  when a skin's `videojs` is not the workspace catalog's version (`pnpm-workspace.yaml`). There are no
  `registryDependencies`, so one item is the whole preset and the no-namespace URL form works.
- `docs`, which the CLI prints after `add`: the pinned requirement, a link to the Video.js docs on playback adapters,
  the skin's page, and a code block (React: the player around `VideoSkin` from `@/components/skins/<name>/video/skin`,
  which imports its own CSS; HTML: the player and preset module imports, and the `<preset-player>` to paste
  `video/skin.html` into).
- `meta`: `role: 'skin'`, `framework`, `styling`, `preset`, `useCase`, `media`, and `component` (React) or `player`
  (HTML).

`@components/` is shadcn's placeholder for the project's `aliases.components` (`components.json`), so the files land
in `src/components/skins/<name>/` in a Vite project with `@/*` mapped to `./src/*`, and in `components/skins/<name>/`
in a Next app. Video.js 10 uses the same mechanism (`@components/videojs/<preset>`).

## Namespace

A shadcn namespace maps to one URL template with a `{name}` placeholder, so one namespace can serve one catalog at a
time. The site documents `@skins` pointed at the framework the visitor picked:

```json
{
  "registries": {
    "@skins": "https://skins.videojs.org/r/react/{name}.json"
  }
}
```

(or `/r/html/{name}.json`), written by `shadcn registry add @skins=<url>`, exactly as Video.js 10 does with
`@videojs`. A project that wants both catalogs can add a second namespace (`@skins-html`) by hand; the item
names are identical, so nothing else changes. The full-URL form (`shadcn add https://skins.videojs.org/r/html/winamp.json`)
needs no namespace at all.

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
  "registries": { "@skins": "https://skins.videojs.org/r/react/{name}.json" }
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
| `pnpm -F build-registry test` | Unit tests for item construction (`tests/items.test.ts`) and the real build over the repository's skin packages into a scratch directory, validating every emitted JSON (`tests/build.test.ts`). |
| `pnpm -F build-registry typecheck` | `tsc` over the package. |
| `pnpm -F build-registry e2e` | `e2e/run.mjs`: fresh Vite React and Vite vanilla-TS projects, `shadcn add` against a local server for `site/public/r`, a Vite build, and a screenshot of each (`REGISTRY_E2E_DIR`, `REGISTRY_E2E_ITEM=winamp`). Needs the npm registry and Playwright's Chromium (`e2e/browser.mjs` launches it); CI runs it after `pnpm test`. Its WebM sample (`e2e/media/sample.webm`) is also the media `scripts/fit-check` plays. |

The build runs on Node's built-in TypeScript support (`node build.ts`), so the package's sources use only erasable
syntax and explicit `.ts` import specifiers.
