# Porting Media Chrome themes to Video.js 10 skins

Each theme under `themes/<name>` (the Media Chrome edition, kept for reference) becomes a package under `skins/<name>`
with an HTML custom element, a React component, and one shared stylesheet. `skins/microvideo` is the reference
implementation; copy it rather than starting from scratch.

Companion documents: [best-practices.md](best-practices.md) (rules and mappings), [friction-log.md](friction-log.md)
(status table and v10 gaps), `friction/<name>.md` (per-skin log), `screens/<name>.png` (the latest comparison).

## Package layout

```
skins/<name>/
  package.json            @player.style/<name>, 1.0.0-alpha.0, MIT, type: module, files: [dist], sideEffects: [./dist/html.js]
  README.md               HTML and React usage, the custom properties the skin honours
  tsconfig.json           typecheck: src, tests, vite.config.ts
  tsconfig.build.json     declarations only, src -> dist/types
  vite.config.ts          one line: defineSkinConfig({ dir: import.meta.dirname })
  src/skin.css            the single stylesheet, class selectors only
  src/html/template.html  the shadow-DOM markup: <media-container class="media-skin ps-<name>" data-theme="<name>" data-preset="video|audio">
  src/html/index.ts       defines <<name>-skin>; registers the @videojs/html/ui/* elements the template uses
  src/react/index.tsx     'use client'; export function <Name>Skin(props: ContainerProps)
  tests/skin.test.ts      parity guards: class-only CSS, every used element registered, same icons and classes in both editions
```

Exports: `.` → `dist/html.js`, `./react` → `dist/react.js`, `./skin.css` → `dist/skin.css`, with types under
`dist/types/`. `@videojs/html`, `@videojs/react`, and `react` are optional peer dependencies at `10.0.0-rc.2` and
`^18 || ^19`. `scripts/build-skin` owns the Vite library config: ES modules only, the Video.js packages and React
external, no minification, `?raw` template and `?inline` CSS for the HTML entry, and a copy of `src/skin.css` into
`dist/`.

Naming: tag `<name>-skin`, component `<Name>Skin` (PascalCase of the slug), root class `ps-<name>`, container name
`ps-<name>`, every other class `ps-*`. The harness and the site derive names from the slug, so keep to it.

## Procedure

1. **Read the original.** `themes/<name>/template.html`, and `git show media-chrome:site/themes/<name>.md` for the
   title, description, author, and tags. Note every `:host([attr])` variant, `breakpoint*` rule, `--media-*` custom
   property, and `<template if>` branch; decide up front which ones are in scope (see the microvideo log).
2. **Capture the original.** Add the skin to `apps/skin-compare/src/skins.ts` (the `legacy` entry is enough to start;
   add `kind: 'audio'` for an audio theme and `aspect: '9 / 16'` for a portrait one, see below), run
   `pnpm compare:skin <name>`, and read the original's row at each width and state before writing CSS. The `hover`,
   `volume-hover`, `scrub-hover`, and `playing-inactive` columns show most of a theme's behaviour. Hover states target
   the first *visible* match, so a theme that swaps controls by width still gets its `scrub-hover` column; a theme with
   no mute button gets no `volume-hover` column. Then dump the live original's boxes (every shadow root, at each width
   and at each breakpoint edge) before writing CSS; best-practices.md explains why.
3. **Scaffold.** Copy the closest existing port (microvideo for a plain video bar, sutro-audio or tailwind-audio for
   audio, reelplay or winamp for bitmap artwork, x-mas for inline SVG) and rename the slug
   (`grep -rn <old> skins/<name>`). A brand-new theme also adds `- '!themes/<name>'` under `packages` in
   `pnpm-workspace.yaml` (the legacy theme's identical package name would shadow the new one) and runs `pnpm install`.
4. **Port the HTML edition** in `template.html`: map each element with the table in best-practices.md, paste the
   theme's SVGs inside the buttons (one per state, no `slot=` attributes), and register each `media-*` element in
   `index.ts`. Reference [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for a first
   draft of most themes' markup and CSS. An audio theme uses `data-preset="audio"` and the conventions under "Audio
   themes" in best-practices.md (no controls layer, artwork as `media-poster`, height follows content).
5. **Port the React edition** in `index.tsx` with the same class names and icons; `pnpm -F @player.style/<name> test`
   checks the two editions agree.
6. **Write `skin.css`** from the theme's own values (control height, paddings, colours, radii) rather than eyeballing
   the screenshots; media-chrome's defaults live in `node_modules/media-chrome/dist/*.js` when the theme inherits one.
7. **Capture and compare.** `pnpm compare:skin <name>` writes `docs/porting/screens/<name>.png` and the individual
   shots to the scratchpad. Open the composite and fix every difference that is not a documented v10 gap. Repeat.
8. **Check the accent.** The `accent-hover` column renders with `--media-accent-color: #f5c518`; the theme's primary
   colour must follow it in both ports.
9. **Register on the site.** Add a `ported({ … })` entry to `site/lib/skins.ts` (video entries before audio ones;
   `useCase: 'audio'` switches the preview, hero, card, and usage snippets to `AudioPlayer`/`<audio-player>`; set
   `preview: { fixedSize: true }` for a skin that draws at a fixed size, and `preview: { metadata: true }` for one that
   shows a title and byline), a loader module under `site/lib/third-party/<name>.tsx`, its line in
   `site/lib/third-party-previews.tsx`, and the dependency in `site/package.json`. The sitemap and static params follow
   `skins`.
10. **Log the friction** in `friction/<name>.md` and add the row to `friction-log.md`.
11. **Verify**: `pnpm install`, `pnpm -F @player.style/<name> build`, `pnpm typecheck`, `pnpm lint`,
    `pnpm format && pnpm format:check`, `pnpm test`, `pnpm build`, then `pnpm compare:skin <name>` once more and a
    look at `/` and `/skins/<name>` (`node apps/skin-compare/scripts/site-shots.mjs http://127.0.0.1:3000 / /skins/<name>`
    against `pnpm -F site start`; `--full` for whole pages). While another port is in progress in the same tree, lint
    and format by path (`vp lint skins/<name> apps/skin-compare`, `vp fmt --check skins/<name>`) so its half-written
    files do not fail your run; run the root commands before handing off. `vp fmt` ignores every `*.md` file.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm build:skins` | Builds every `skins/*` package (`vp build` + `tsc` declarations). |
| `pnpm build` | Skins, then the site. |
| `pnpm -F @player.style/<name> build \| test \| typecheck \| clean` | One skin. |
| `pnpm compare:skin <name>` | Captures original × HTML × React at 360/720/1080 in eight states and writes the composite. |
| `pnpm -F skin-compare dev` | The harness at `/index.html?skin=<name>&w=640` (`&accent=f5c518` to preview the accent). |
| `node apps/skin-compare/scripts/make-media.mjs [--portrait \| --audio \| --all]` | Regenerates the test media in `apps/skin-compare/public/media`: the 16:9 pattern and poster (default), the 9:16 pattern and poster, the WebM/Opus tone. |
| `node apps/skin-compare/scripts/site-shots.mjs <base> <path…>` | Screenshots site pages at 1280×900 (`--full` for whole pages) in light and dark into the scratchpad, with each page's console errors and failed requests. |

### Audio and portrait skins

Two optional fields on a skin's entry in `apps/skin-compare/src/skins.ts`:

- `kind: 'audio'` puts the original's media in `<audio slot="media">`, the HTML port in `<audio-player>`
  (`@videojs/html/audio/player`), the React port in `AudioPlayer` + `Audio` (`@videojs/react/audio`), and plays
  `media/tone.webm`. All eight states still run; `scrub-hover` shows the preview time only. In the dev page each
  audio pane's iframe follows its content height.
- `aspect: '9 / 16'` (any CSS `aspect-ratio`) sets the player box on each pane's skin element and sizes the capture
  viewport to it; a portrait ratio also switches to `media/pattern-portrait.webm` and `poster-portrait.png`.
  `pnpm compare:skin <name> --aspect '9 / 16'` (or `?aspect=` in the dev harness) overrides it for one run.

`--src`/`--poster` still override the media.

### Preset per theme

Video: demuxed-2022, halloween, instaplay, microvideo, minimal, notflix, reelplay, sutro, vimeonova, winamp, x-mas, yt.
Audio: sutro-audio, tailwind-audio. Winamp's docs page says `audio: true`, but its template renders a video window
(`<slot name="media">` inside a black `media-controller`, a poster slot, a fullscreen button) above the fixed 275px
main panel, and #2714 ported it as video; it stays on the video preset. tailwind-audio's port ships plain CSS
translated by hand from the theme's Tailwind utilities (see `skins/tailwind-audio/README.md`).

The harness loads the Media Chrome edition from jsDelivr (`@player.style/<name>@<version>/+esm`, pinned in
`skins.ts`) and the ports from their sources under `skins/*`, so edits show up without a build. In this container
Chromium reaches jsDelivr through the sandbox proxy; `scripts/browser.mjs` handles the proxy and its CA.

## Checklist for a new skin

- [ ] Original read; variants, breakpoints, custom properties, and stream-type branches listed with an in/out decision
- [ ] `skins/<name>` copied from the closest port; slug renamed everywhere; `!themes/<name>` added to the workspace
- [ ] HTML edition renders inside `<video-player>` (or `<audio-player>`) with its media and `<img slot="poster">`
- [ ] React edition renders inside `<VideoPlayer poster>` with `<Video>` (or `AudioPlayer` with `Audio`)
- [ ] Both editions pass `tests/skin.test.ts` (class-only CSS, elements registered, icons and classes in sync)
- [ ] Composite matches the original at 360/720/1080 in idle, hover, volume, scrub, playing, inactive, paused states
- [ ] `--media-accent-color` recolours the colour the theme's accent fed (best-practices.md, "Accent mapping")
- [ ] Site entry (with `useCase` and any `preview` flags), loader module, preview registry line, and `site/package.json` dependency added
- [ ] `friction/<name>.md` written and `friction-log.md` row added
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build` clean

## Publishing

Every skin package is at `1.0.0-alpha.0` and none is published yet: publishing is not wired on main (the root
README's "Skins" section; `cd.yml` runs release-please for the site only, and the Media Chrome editions still publish
from the `media-chrome` branch). Before the first release:

- **release-please:** add each `skins/<name>` to `.github/release-please/release-please-config.json` (`packages`) and
  the manifest at `1.0.0-alpha.0`, with prerelease versioning, so each skin gets its own changelog and
  `@player.style/<name>@<version>` tag.
- **CD:** a publish job after release-please that runs `pnpm install --frozen-lockfile`, `pnpm build:skins`, and
  `pnpm publish` for each released skin (`files: [dist]` only), with npm provenance.
- **npm dist-tags:** the same package names carry the Media Chrome editions (0.x) under `latest`. Publish the 1.x
  alphas under `next` so `npm install @player.style/<name>` keeps resolving the Media Chrome edition, move `latest`
  to 1.x once Video.js 10 is stable, and keep 0.x fixes from the `media-chrome` branch under a `media-chrome` tag.
