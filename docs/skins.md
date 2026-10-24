# Adding a skin

A community skin is a [`skin create`](https://videojs.org) project: run `npx @videojs/cli skin create`, design the
skin in its workbench, then take it into this repository with `scripts/add-skin`. The repository keeps the project's
source as it is, builds a preview module per preset for the site and the fit check, and serves the source from the
`@skins` shadcn registry at [skins.videojs.org](https://skins.videojs.org). There is no npm package and no template
of our own.

## Layout

```
skins/<name>/
  catalog.json           what the gallery and the registry say about the skin (below)
  README.md              optional: credits and differences from an original
  react/                 workspace package @skins/<name>-react (private)
    skin.json            as skin create wrote it
    package.json         written by add-skin
    tsconfig.json        extends ../../../tsconfig.skin.json, maps @/* to ./src/*
    vite.config.ts       defineSkinConfig({ dir: import.meta.dirname })
    src/<preset>/skin.tsx    export function VideoSkin (LiveVideoSkin, AudioSkin, …)
    src/styles/, lib/, ui/   shared by every preset of the package
    src/skin.css         skin create's workbench sheet: unused for CSS skins, the Tailwind entry for Tailwind ones
  html/                  @skins/<name>-html, the same with
    src/<preset>/skin.ts     registers the Video.js elements and imports the CSS
    src/<preset>/skin.html   the light-DOM markup, with <!-- Add a compatible media component here. -->
```

`<name>` is the skin's slug everywhere: its page (`/skins/<name>`), its registry items, its install folder
(`components/skins/<name>/`). It cannot end in `-live`: the site redirects `/skins/<name>-live` to a skin's live use
case. A skin may ship one framework or both, and one preset folder (`video`, `audio`, `live-video`, `live-audio`) or
several; the first in that order is its default use case. The workbench (`apps/`), the deploy files, the nested
`pnpm-workspace.yaml`, `AGENTS.md`, `CLAUDE.md` and the CLI's README are left behind.

## Intake

```sh
npx @videojs/cli@10.2.0 skin create ../my-skin --framework react --styling css --preset video
# design it in the workbench, then:
node scripts/add-skin/add-skin.ts ../my-skin --name my-skin --owner <github-user or videojs/collaborators>
pnpm install && pnpm build:skins && pnpm -F fit-check test -t my-skin
```

`add-skin` checks that the project targets this repository's Video.js major, copies `src/`, `skin.json` and
`package.json`, writes the shared `vite.config.ts` and `tsconfig.json`, and makes `package.json` a private workspace
package: `@videojs/*` and `react` become peers (`^10`, `^18 || ^19`) built against the workspace catalog, other
runtime packages (`cn`) stay dependencies, the workbench's devDependencies go. It creates `catalog.json` and adds
`/skins/<name>/ @<owner>` to `.github/CODEOWNERS`.

It also renames the skin's base theme (`scaffold`, `default`, …) to its name wherever the base is the theme:
`data-theme="…"`, `registerIcons('…'`, `family="…"`. Every `skin create` rule is scoped to `data-theme`, so two skins
from the same base, or a skin and the first-party default, would otherwise style each other on the gallery page.
Edit `styles/themes/<base>.css` and the preset sheets, not the shared foundations (`styles/base.css`,
`styles/themes/theme.css`), which every skin on the page shares.

For a second framework, run `skin create` with the other `--framework` and `add-skin` with the same `--name`. For a
second preset (live video, say), run `skin create --preset live-video` and `add-skin` with the same `--name`: it
merges the preset in, requiring the same framework, styling and base. It copies `src/<preset>/`, adds shared files the
skin lacks, lists shared files that differ instead of overwriting them, and adds any new dependencies.

Tailwind skins (`styling: "tailwind"`) are accepted: the build adds `@tailwindcss/vite` and loads `src/skin.css` (the
Tailwind v4 entry) with every preset, and the registry ships that file so a consumer can `@import` it.

## `catalog.json`

```json
{
  "title": "Winamp",
  "description": "A retro theme inspired by the classic Winamp media player.",
  "author": { "name": "mave.io", "url": "https://mave.io", "github": "maveio" },
  "preview": { "fixedSize": true }
}
```

`title`, `description` and `author.name` are required. `preview` tunes the gallery: `fixedSize` (the skin draws at its
own size, so it gets no 16:9 box), `metadata` (it shows a title and byline, so the preview passes them) and `portrait`
(it plays the portrait demo video). Use cases are not listed: they are the preset folders. The retired Media Chrome
gallery's `/themes/<name>` redirects to `/skins/<name>`, so a skin that recreates a theme keeps the theme's name.

## Build output

`scripts/build-skin` owns the Vite library config. Each preset becomes `dist/<preset>.js` and `dist/<preset>.css`,
with `@videojs/*` and React external and nothing minified; a stylesheet several presets import becomes one shared
`dist/<sheet>.css` instead (`videojs-8.css`). The module imports its own CSS, as the source does. React:
the preset's named export (`VideoSkin`). HTML: the side-effect registrations, and `skin.html` as the default export.
The site and the fit check load these modules; the registry reads `src/`.

Every skin build also writes `site/lib/generated/` (gitignored): `skin-builds.json`, which presets are built, and
`skin-loaders.ts`, one `import()` per built module, so the site loads a skin's chunk only with its preview. A skin is
listed once `catalog.json` and one built preset exist; the site's `dev` and `build` stop with a message when the
folder is missing.

Cards render the React build (the HTML one when a skin ships HTML only). The skin page previews the build its install
section installs from: HTML by default and for `?framework=vue` or `svelte`, React for `?framework=react` or when the
skin has no HTML build. An HTML preview mounts `skin.html` in the preset's player element, with every id suffixed per
instance. It mounts on the client after hydration, once the player element and the skin's chunk have loaded, so the
server-rendered page has an empty box where it goes. Under `next dev` the first request to a skin page compiles the
page and its chunks (minutes on a busy machine; the request returns when they are done), and a skin rebuilt while
`dev` runs is picked up on the next reload: no restart, and no need to delete `site/.next`.

## Checks

- `scripts/build-skin/tests/skins.test.ts`: every package is a `skin create` project for its folder on the workspace
  Video.js, with a skin entry in every preset folder, `skin.html` placeholders, `catalog.json` fields, and nothing of
  the workbench left behind.
- `scripts/fit-check`: every preset of every package at 320 and 375px wide under phone emulation, in Chromium and
  WebKit, failing on overflow, overlapping text, targets under 44px and menus outside the player. There are no
  per-skin exceptions; see its README for the rules and allowances. Fix failures in the skin's own sheets: container
  queries for width, `@media (pointer: coarse)` for touch.
- `scripts/build-registry`: unit tests, the real build into a scratch directory, and `pnpm -F build-registry e2e`,
  which installs a skin with the stock shadcn CLI into fresh Vite React and vanilla projects and builds them.

## Commands

```sh
pnpm install
pnpm build:skins                          # every skins/<name>/<framework> package
pnpm build:registry                       # site/public/r, from the skins' sources
pnpm -F fit-check test -t <name>          # after build:skins
pnpm -F build-registry e2e                # after build:registry
pnpm typecheck && pnpm lint && pnpm format:check
pnpm test                                 # build-skin, build-registry and site tests, then the fit check
pnpm build                                # skins, registry, then the site
```
