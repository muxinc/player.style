# Registry: shadcn end to end

What it took to serve the open editions as a shadcn registry (`scripts/build-registry`, hosted at
`https://player.style/r/<framework>/<item>.json`) and to prove `shadcn add` works against it from two fresh Vite
projects. The proof is scripted in `scripts/build-registry/e2e/run.mjs` (`pnpm -F build-registry e2e`); this file
records the run of 2026-09-24 and what the CLI did that was not obvious.

## Setup

- shadcn CLI `4.21.0` (the `shadcn` devDependency of `scripts/build-registry`, also what `shadcn build` runs on);
  `create-vite@8.2.0`; pnpm 12.6.0; Node 22.22; Playwright's Chromium from `apps/skin-compare/scripts/browser.mjs`.
- Registry built with `pnpm build:registry` from the built skins, then served from `site/public/r` by a plain
  `node:http` static server on `127.0.0.1:<random port>` under `/r/`, the same paths the site serves.
- Projects under the scratchpad (`REGISTRY_E2E_DIR`), item `yt` (`REGISTRY_E2E_ITEM`).

## Commands and outcomes

### Vite + React + TypeScript (namespaced add)

```sh
pnpm dlx create-vite@8.2.0 vite-react --template react-ts --no-interactive
# write tsconfig.json (flat, with "baseUrl": "." and "paths": { "@/*": ["./src/*"] }), vite.config.ts (alias @ -> ./src),
# components.json (below, registries -> http://127.0.0.1:<port>/r/react/{name}.json), packageManager: pnpm@12.6.0
pnpm install
shadcn view @player-style/yt --cwd vite-react
shadcn add @player-style/yt --yes --overwrite --cwd vite-react
# -> src/components/player-style/yt/Skin.tsx, src/components/player-style/yt/skin.css
# -> package.json dependencies: "@videojs/react": "10.0.0-rc.2" (installed by the CLI with pnpm)
# write src/App.tsx: <VideoPlayer><YtSkin><Video src={demo mp4} poster={demo poster} /></YtSkin></VideoPlayer>
pnpm run build          # tsc -b && vite build: clean
pnpm exec vite preview --port 5411
```

Screenshot: `<REGISTRY_E2E_DIR>/vite-react.png` (this run:
`/tmp/claude-0/-home-user/77d70884-8b6f-538a-a323-0f0f578cef31/scratchpad/registry-e2e/vite-react.png`). The YT skin
renders around the media with poster, time slider, play, mute, time display, settings, PiP and fullscreen.
`Skin.tsx` and `skin.css` are byte-identical to `skins/yt/dist/open/`.

### Vite vanilla TypeScript (full-URL add, no Tailwind, no React)

```sh
pnpm dlx create-vite@8.2.0 vite-html --template vanilla-ts --no-interactive
# same tsconfig.json / vite.config.ts / components.json treatment, css: src/style.css, registries -> /r/html/
pnpm install
shadcn view http://127.0.0.1:<port>/r/html/yt.json --cwd vite-html
shadcn add http://127.0.0.1:<port>/r/html/yt.json --yes --overwrite --cwd vite-html
# -> src/components/player-style/yt/{skin.html,register.ts,skin.css}
# -> package.json dependencies: "@videojs/html": "10.0.0-rc.2"
# write src/main.ts: import '@videojs/html/video/player'; import './components/player-style/yt/register';
#   import './components/player-style/yt/skin.css'; import skin from './components/player-style/yt/skin.html?raw';
#   root.innerHTML = `<video-player>${skin.replace(placeholder, '<video src=... poster=...></video>')}</video-player>`
pnpm run build          # tsc && vite build: clean
pnpm exec tsc --noEmit -p tsconfig.json
pnpm exec vite preview --port 5412
```

Screenshot: `<REGISTRY_E2E_DIR>/vite-html.png`. Same rendering as the React project. All three files byte-identical
to `skins/yt/dist/open/`.

### The minimal `components.json`

Neither project ran `shadcn init`; this hand-written file was enough for `add` (and `view`):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "utils": "@/lib/utils",
    "hooks": "@/hooks"
  },
  "registries": { "@player-style": "https://player.style/r/react/{name}.json" }
}
```

`tailwind.css` must name an existing stylesheet (`src/style.css` in the vanilla template) but nothing is written to it
for these items; no Tailwind package is installed or required. `site/lib/registry.ts` exposes it as
`componentsJsonSnippet(framework)`.

## Surprises

- **`cssVariables: false` corrupts the skins.** The first run set `"cssVariables": false` (no Tailwind, so no CSS
  variables seemed right). With that setting the CLI fetches `colors/neutral.json` from ui.shadcn.com and runs its
  colour-mapping transform over every JSX string literal in a `.tsx` file, treating each as a class list: it splits
  on spaces and deduplicates tokens. `viewBox="0 0 24 24"` became `"0 24"`, `d="... 0 0 1 1.9 ..."` lost arc flags,
  and even `names.join(' ')` became `join('')`; 64 changed lines in `Skin.tsx`, every icon broken, and a
  console full of SVG attribute errors. `.css` and `.html` files were untouched. With `"cssVariables": true` the
  file is written byte for byte. Documented in the README and baked into the snippet; the e2e now diffs every
  installed file against the hosted item and fails on any rewrite.
- **`rsc: false` did not strip `'use client'`.** The CLI has a transform that removes the directive when `rsc` is
  false, but the installed `Skin.tsx` kept it in both runs. Harmless either way; the e2e records a note if it ever
  disappears rather than failing.
- **Alias resolution needs a flat tsconfig.** The stock `react-ts` scaffold puts `compilerOptions` in
  `tsconfig.app.json` behind project references and has no `paths`. The CLI resolves `aliases.components` through
  `tsconfig.json` (tsconfig-paths), so without `baseUrl` + `paths` in the root `tsconfig.json` the `@components/...`
  targets have nowhere to go. A flat `tsconfig.json` with `"paths": { "@/*": ["./src/*"] }` (what Video.js 10's e2e
  writes too) fixed it; the same alias goes into `vite.config.ts` so the project's own `@/` imports work, although the
  skins themselves import nothing through it.
- **`@components/` placeholder works as documented.** Targets `@components/player-style/yt/Skin.tsx` landed at
  `src/components/player-style/yt/Skin.tsx` in both projects (`aliases.components` = `@/components` = `src/components`).
  Nothing else was created: no `lib/utils.ts`, no Tailwind, no extra dependencies beyond the pinned `@videojs/*`.
- **The CLI installs `dependencies` itself** with the detected package manager; setting `"packageManager": "pnpm@12.6.0"`
  and having a `pnpm-lock.yaml` before `add` made it pick pnpm. The exact pin (`@videojs/react@10.0.0-rc.2`) went
  into `package.json` as-is.
- **`shadcn view <url>` and `shadcn add <url>`** accept a plain `http://127.0.0.1:<port>/...` URL, so the full-URL
  form needs no namespace and no `components.json` `registries` entry (the file is still required for aliases).
- **The `@videojs/*` imports were not rewritten.** The CLI only rewrites `@/registry/...`-style paths and
  `lucide-react` icon imports; the skins have neither.
- **Headless Chromium has no H.264.** The demo MP4 (`stream.mux.com/.../highest.mp4`) hits `MEDIA_ELEMENT_ERROR:
  Format error` in Playwright's Chromium, which is a codec limitation of the test browser, not of the skin or the
  registry (the first screenshot showed the skin's error dialog over the poster, proving the skin rendered). The apps
  keep the real URL; for the screenshot the e2e routes that URL to `apps/skin-compare/public/media/sample.webm`
  (`page.route` + `fulfill`), which is why `summary.json` lists the MP4 under `failedRequests` as `net::ERR_ABORTED`.
- **`shadcn build` copies `registry.json` into the output** next to the item files and reads each `files[].path`
  relative to `--cwd`, so the build stages every catalog under `scripts/build-registry/dist/<framework>/` and runs the
  CLI there; `catalog.json` is written by the build itself. The item JSON keeps `path` (`yt/Skin.tsx`) and adds
  `content`; the CLI installing it uses `target`.
- **Workspace timing.** `vp run` (and even `pnpm exec`) refuses to run while a workspace dependency is unresolved
  (another agent's `@player.style/microvideo-live` was in `site/package.json` before the package existed), so the
  package tests ran through `node_modules/.bin/vp test run` directly until the live packages landed. The registry
  build itself skips a skin whose `dist/open` is missing and names it in its output line.

## How to run it again

```sh
pnpm build:skins && pnpm build:registry
REGISTRY_E2E_DIR=/tmp/registry-e2e pnpm -F build-registry e2e          # yt
REGISTRY_E2E_ITEM=sutro-audio pnpm -F build-registry e2e               # any item name
```

It needs the network (create-vite, npm) and the harness's Chromium; it is not wired into CI. Output: the two projects,
`vite-react.png`, `vite-html.png`, and `summary.json` (commands, installed files, dependency, failed requests, notes)
under `REGISTRY_E2E_DIR`.
