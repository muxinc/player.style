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
  src/html/template.html  the shadow-DOM markup: <media-container class="media-skin ps-<name>" data-theme="<name>" data-preset="video">
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
2. **Capture the original.** Add the skin to `apps/skin-compare/src/skins.ts` (the `legacy` entry is enough to start),
   run `pnpm compare:skin <name>`, and read the original's row at each width and state before writing CSS. The
   `hover`, `volume-hover`, `scrub-hover`, and `playing-inactive` columns show most of a theme's behaviour.
3. **Scaffold.** The remaining themes are pre-scaffolded (see "Scaffolded packages"): copy `src/` and
   `tests/skin.test.ts` from `skins/microvideo` over the placeholders and rename the slug
   (`grep -rn microvideo skins/<name>`); leave `package.json` alone. A brand-new theme copies the whole package, adds
   `- '!themes/<name>'` under `packages` in `pnpm-workspace.yaml` (the legacy theme's identical package name would
   shadow the new one), and runs `pnpm install`.
4. **Port the HTML edition** in `template.html`: map each element with the table in best-practices.md, paste the
   theme's SVGs inside the buttons (one per state, no `slot=` attributes), and register each `media-*` element in
   `index.ts`. Reference [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for a first
   draft of most themes' markup and CSS.
5. **Port the React edition** in `index.tsx` with the same class names and icons; `pnpm -F @player.style/<name> test`
   checks the two editions agree.
6. **Write `skin.css`** from the theme's own values (control height, paddings, colours, radii) rather than eyeballing
   the screenshots; media-chrome's defaults live in `node_modules/media-chrome/dist/*.js` when the theme inherits one.
7. **Capture and compare.** `pnpm compare:skin <name>` writes `docs/porting/screens/<name>.png` and the individual
   shots to the scratchpad. Open the composite and fix every difference that is not a documented v10 gap. Repeat.
8. **Check the accent.** The `accent-hover` column renders with `--media-accent-color: #f5c518`; the theme's primary
   colour must follow it in both ports.
9. **Register on the site.** Add the entry to `site/lib/skins.ts` after the first-party skins, a loader module under
   `site/lib/third-party/<name>.tsx`, its line in `site/lib/third-party-previews.tsx`, and the dependency in
   `site/package.json`. The sitemap and static params follow `skins`.
10. **Log the friction** in `friction/<name>.md` and add the row to `friction-log.md`.
11. **Verify**: `pnpm install`, `pnpm -F @player.style/<name> build`, `pnpm typecheck`, `pnpm lint`,
    `pnpm format && pnpm format:check`, `pnpm test`, `pnpm build`, then `pnpm compare:skin <name>` once more and a
    look at `/` and `/skins/<name>` (`node apps/skin-compare/scripts/site-shots.mjs http://127.0.0.1:3000 / /skins/<name>`
    against `pnpm -F site start`).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm build:skins` | Builds every `skins/*` package (`vp build` + `tsc` declarations). |
| `pnpm build` | Skins, then the site. |
| `pnpm -F @player.style/<name> build \| test \| typecheck \| clean` | One skin. |
| `pnpm compare:skin <name>` | Captures original × HTML × React at 360/720/1080 in eight states and writes the composite. |
| `pnpm -F skin-compare dev` | The harness at `/index.html?skin=<name>&w=640` (`&accent=f5c518` to preview the accent). |
| `node apps/skin-compare/scripts/make-media.mjs [--portrait \| --audio \| --all]` | Regenerates the test media in `apps/skin-compare/public/media`: the 16:9 pattern and poster (default), the 9:16 pattern and poster, the WebM/Opus tone. |
| `node apps/skin-compare/scripts/site-shots.mjs <base> <path…>` | Screenshots site pages at 1280×900 in light and dark into the scratchpad. |

### Audio and portrait skins

Two optional fields on a skin's entry in `apps/skin-compare/src/skins.ts`:

- `kind: 'audio'` puts the original's media in `<audio slot="media">`, the HTML port in `<audio-player>`
  (`@videojs/html/audio/player`), the React port in `AudioPlayer` + `Audio` (`@videojs/react/audio`), and plays
  `media/tone.webm`. All eight states still run; `scrub-hover` shows the preview time only.
- `aspect: '9 / 16'` (any CSS `aspect-ratio`) sets the player box on each pane's skin element and sizes the capture
  viewport to it; a portrait ratio also switches to `media/pattern-portrait.webm` and `poster-portrait.png`.
  `pnpm compare:skin <name> --aspect '9 / 16'` (or `?aspect=` in the dev harness) overrides it for one run.

`--src`/`--poster` still override the media.

### Preset per theme

Video: demuxed-2022, halloween, instaplay, microvideo, minimal, notflix, reelplay, sutro, vimeonova, winamp, x-mas, yt.
Audio: sutro-audio, tailwind-audio. Winamp's docs page says `audio: true`, but its template renders a video window
(`<slot name="media">` inside a black `media-controller`, a poster slot, a fullscreen button) above the fixed 275px
main panel, and #2714 ported it as video; it stays on the video preset. tailwind-audio's port ships Tailwind output
compiled once into a static `skin.css` (see `skins/tailwind-audio/README.md`).

### Scaffolded packages

The 11 unported themes already have `skins/<name>` (package.json, tsconfigs, `vite.config.ts`, placeholder sources and
test), their `!themes/<name>` workspace line, and a harness entry, so a port never touches `package.json`, the
workspace file, or the lockfile. Step 3 of the procedure is then just replacing the placeholders with microvideo's
files (`tests/skin.test.ts` included) and renaming the slug.
Registering an audio skin on the site also needs `ThirdPartyPlayer` in `site/app/_components/SkinPreview.tsx` and
`getThirdPartyUsageSnippet` in `site/lib/third-party-usage.ts` to branch on `useCase`; both assume video today.

The harness loads the Media Chrome edition from jsDelivr (`@player.style/<name>@<version>/+esm`, pinned in
`skins.ts`) and the ports from their sources under `skins/*`, so edits show up without a build. In this container
Chromium reaches jsDelivr through the sandbox proxy; `scripts/browser.mjs` handles the proxy and its CA.

## Checklist for a new skin

- [ ] Original read; variants, breakpoints, custom properties, and stream-type branches listed with an in/out decision
- [ ] `skins/<name>` scaffolded from microvideo; slug renamed everywhere; `!themes/<name>` added to the workspace
- [ ] HTML edition renders inside `<video-player>` with `<video>` and `<img slot="poster">`
- [ ] React edition renders inside `<VideoPlayer poster>` with `<Video>`
- [ ] Both editions pass `tests/skin.test.ts` (class-only CSS, elements registered, icons and classes in sync)
- [ ] Composite matches the original at 360/720/1080 in idle, hover, volume, scrub, playing, inactive, paused states
- [ ] `--media-accent-color` recolours the theme's primary colour
- [ ] Site entry, loader module, preview registry line, and `site/package.json` dependency added
- [ ] `friction/<name>.md` written and `friction-log.md` row added
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build` clean
