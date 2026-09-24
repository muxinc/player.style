# Round 2 requirements (working plan; delete before merge)

Agreed with Darius on 2026-09-24. Source of truth for the second build round.

## Packaging

- Keep the classic `player.style` package shape: the root package re-exports every skin as
  `player.style/<name>`, `player.style/<name>/react`, and `player.style/<name>/skin.css`, pointing at
  `skins/<name>/dist`. It depends on every `@player.style/<name>`. Root becomes `1.0.0-alpha.0` and is no longer
  private. Each skin also publishes on its own as `@player.style/<name>`.
- Peer dependencies pin `@videojs/html` and `@videojs/react` at exactly `10.0.0-rc.2`; bumps are manual.
- Dist-tags: alphas publish under `next`; `latest` moves when Video.js 10 is GA; `media-chrome` stays on the old
  branch for 0.x fixes.
- Release automation: release-please tracks root plus every `skins/*` package with the node-workspace plugin. CD
  runs `pnpm build:skins`, then `scripts/publish-packages` publishes root and every skin whose version is not on
  npm, with `--tag next --access public --provenance`.
- Delete the legacy tree from main: `themes/`, `scripts/build-theme`, `examples/`. The compare harness loads the
  originals from jsDelivr, so nothing depends on them.

## Skins

- HTML edition stays shadow DOM (packaged). React edition stays a light-DOM component. Both keep one shared
  stylesheet; the parity test stays.
- Open edition: the build emits `dist/open/` per skin: `skin.html` (light-DOM markup, `<slot>` replaced by a
  placeholder comment, named slots unwrapped, like v10's source-owned HTML), `skin.css`, `register.ts` (the
  `@videojs/html/ui/*` imports the markup needs plus icon registration), and `Skin.tsx` (the React source). The site
  shows these with copy buttons. No shadcn registry in this repo yet.
- Theming tokens: every skin honours `--media-primary-color`, `--media-secondary-color`, and `--media-accent-color`
  the way its original did, as its own public API. In addition `--media-accent-color` overrides the theme's main
  brand colour so the site's picker is meaningful. Each README lists the tokens.
- Live variants: microvideo, essentials (was minimal), demuxed-2022, and x-mas branch on stream type in the original.
  Each ships a live edition on the live-video preset as a sibling package named like a first-party skin:
  `skins/<name>-live`, `@player.style/<name>-live` (HTML at `.`, React at `./react`, `./skin.css`), re-exported as
  `player.style/<name>-live`. The gallery lists them as `<Title> Live` cards with use case live video, slug
  `<name>-live` (decided 2026-09-24; this replaces the `/live` subpath model committed in `1df3c24`).
- Host variants: microvideo's `controlbarplace` and `controlbarvertical` become attributes on the element and props
  on the component.
- Template conditionals (`<template if>`) in microvideo, essentials, notflix, sutro-audio, vimeonova: every branch is
  either ported or listed in the friction log as a scope cut with a reason.
- Rename: the classic `minimal` theme becomes **Essentials** (`skins/essentials`, `@player.style/essentials`,
  `<essentials-skin>`, `EssentialsSkin`, root class `ps-essentials`). The media-chrome edition stays published as
  `@player.style/minimal` under its own tag.
- Reduced motion: match the originals.
- Winamp stays on the video preset.

## Site

- Demo media everywhere is the classic player.style asset: landscape `fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ`
  (poster `thumbnail.webp?time=52`, storyboard `storyboard.vtt`, chapters `/landscape-test-chapters.vtt`, title
  "Landscape Promo", byline "by Mux") and portrait `1EFcsL5JET00t00mBv01t00xt00T4QeNQtsXx2cKY6DLd7RM` for instaplay.
  Audio skins use the landscape asset's audio (`/audio.m4a`) with its poster as artwork. Live cards keep a Mux live
  stream. First-party skins switch too.
- First-party skin pages: no framework or media pickers. The Customize section stays. One primary button links to
  the framework-agnostic installation route on videojs.org carrying only `preset` and `skin`.
- Third-party skin pages keep the classic flow: accent colour, media, framework, packaged/open, then snippets.
  - Media options follow the v10 renderer list for the skin's preset: video = Video file, HLS, DASH, Mux, Vimeo,
    YouTube, Cloudflare, Wistia, TikTok, Twitch; audio = Audio file, Mux, Spotify; live video = HLS, Mux.
  - Framework options: HTML, React, Vue, Svelte. Vue and Svelte use the HTML edition with the custom-element config
    snippets v10's docs give. Under HTML, an install-method toggle npm | CDN; CDN ships only if `@player.style/*` from
    jsDelivr coexists with `@videojs/cdn` in a real test, otherwise it is left out and logged.
  - Packaged shows install command plus usage; Open shows the `dist/open` files with copy buttons.
  - Snippets include the accent (and only the accent) as an inline style when set.
- Filter semantics unchanged. Gallery order unchanged, live cards next to their base skin.

## Docs and hand-off

- Update `docs/porting/README.md`, `best-practices.md`, and the per-skin friction logs for token support, live
  editions, host variants, and the open build. Keep `friction-log.md` as the rollup.
- After the build: refreshed bundle, then the friction logs go to #videojs-feedback in Slack (Darius will say when).

## Round 2B conventions (agreed by the planning agent; agents follow these so the skins converge)

### Live editions

- A live edition is its own package beside the on-demand one, with the same layout as any skin: `skins/<name>-live/`
  with `package.json`, `README.md`, `tsconfig.json`, `tsconfig.build.json`, `vite.config.ts`, `src/html/template.html`,
  `src/html/index.ts`, `src/react/index.tsx`, `tests/skin.test.ts`. No `src/live/` anywhere.
- One stylesheet: the live package has no `src/skin.css`. Its `vite.config.ts` is
  `defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../<name>/src/skin.css' })`, and its HTML entry (or the
  host module it imports) reads the same file with `import styles from '../../<name>/src/skin.css?inline'` (path
  relative to the importing file). The build copies that file to `dist/skin.css` and `dist/open/skin.css`, so
  `@player.style/<name>-live/skin.css` is the same file as `@player.style/<name>/skin.css`. Live-only rules stay in
  the on-demand package's `skin.css`, keyed on `[data-preset="live-video"]` inside the `.ps-<name>` scope; the
  on-demand template never carries that attribute.
- Names: package `@player.style/<name>-live` (version `1.0.0-alpha.0`, homepage `https://player.style/skins/<name>-live`,
  `repository.directory` `skins/<name>-live`, `files: ["dist"]`, `sideEffects: ["./dist/html.js"]`, exports `.`,
  `./react`, `./skin.css`, `./open/*`, `./package.json` exactly as the on-demand package's, same scripts, devDependencies
  and peers). Element `<name>-live-skin` (class `NameLiveSkinElement`), component `NameLiveSkin`, props
  `NameLiveSkinProps`. Root markup keeps the on-demand root: `class="media-skin ps-<name>"`, `data-theme="<name>"`, plus
  `data-preset="live-video"`.
- Host: `<live-video-player>` from `@videojs/html/live-video/player`; React `LiveVideoPlayer` and `Video` from
  `@videojs/react/live-video`. Time controls that make no sense live are dropped the way the original's live branch
  dropped them; a `media-live-button` / `LiveButton` takes their place where the original showed a live indicator.
- Shared host code (shadow-root boilerplate, host-variant mirroring): each package keeps its own copy (microvideo:
  `src/skin-element.ts` in both packages, the live one importing the sibling's `skin.css`); a test in the live package
  checks the copy has not drifted. Nothing is imported across package directories except the stylesheet.
- Build (`build-skin`): the same `html` -> `dist/html.js`, `react` -> `dist/react.js`, `dist/types/{html,react}/`,
  `dist/skin.css`, `dist/open/` as every skin. `detectPreset` reads `data-preset="live-video"` off the template and the
  open edition README documents `<live-video-player>` / `LiveVideoPlayer`. The open edition's `skin.css` is the
  complete stylesheet (a copy of the sibling's).
- Root package: `@player.style/<name>-live` at `1.0.0-alpha.0` in `dependencies`, `./skins/<name>-live/dist/html.js`
  in `sideEffects`; the wildcard exports (`./*`, `./*/react`, `./*/skin.css`, `./*/open/<file>`) cover it, so
  `player.style/<name>-live` needs no extra entry. release-please: `skins/<name>-live` in the config (prerelease alpha)
  and the manifest at `1.0.0-alpha.0`.
- Tests: `skins/<name>-live/tests/skin.test.ts` covers parity between HTML template and React tree, the live-video
  preset on the root, scoping of the shared stylesheet (read from `../../<name>/src/skin.css`), the dropped controls
  against the sibling's template, and the package's name, exports and `sideEffects`. The on-demand package's tests
  no longer mention the live edition beyond a pointer.
- Harness (`apps/skin-compare`): entry `<name>-live` with `kind: 'live-video'` whose `html` and `react` loaders point at
  `skins/<name>-live/src/*` and whose `css` loader points at `skins/<name>/src/skin.css`; the legacy pane sets
  `streamtype="live"` on the media-chrome theme so its live branch renders; the v10 panes use `<live-video-player>` /
  `LiveVideoPlayer`. Capture goes to `docs/porting/screens/<name>-live.png`.
- Site: gallery slug `<name>-live`, package `@player.style/<name>-live`, install and usage snippets as for any skin
  (`import '@player.style/<name>-live'`, `@player.style/<name>-live/react`, `@player.style/<name>-live/skin.css`).

### Theming tokens

- Reproduce the original's use of `--media-primary-color`, `--media-secondary-color`, `--media-accent-color`, and any
  theme-specific `--media-*` tokens, with the same defaults (read `git show media-chrome:themes/<name>/template.html`).
- The theme's dominant brand colour is declared once on the root as a private custom property that reads
  `var(--media-accent-color, <brand default>)`, so setting `--media-accent-color` recolours the brand surface even
  where the original never consulted it. If the original already routed its brand colour through
  `--media-accent-color`, nothing changes.
- The README gets a "Theming" table: token, what it colours, default.
- Tests assert the root declares the brand property from `--media-accent-color`.

### Host variants (microvideo)

- `controlbarplace` (`bottom` default, `center`, `top` per the original) and `controlbarvertical` (boolean) are
  attributes on `<microvideo-skin>` and camel-cased props on `MicrovideoSkin`. The element mirrors them onto the inner
  container as `data-controlbar-place` / `data-controlbar-vertical`; React sets the same data attributes; CSS keys on
  those inside the `.ps-microvideo` scope. Open edition markup documents the data attributes in its header comment.

### Template conditionals

- Every `<template if>` branch in the original is either ported (as a Video.js state selector, a host variant, or an
  edition) or listed in `docs/porting/friction/<name>.md` under "Scope cuts" with the reason.

### Working rules for this round

- Build only your own skin: `pnpm -F @player.style/<name> build`, then `pnpm -F @player.style/<name> test` and
  `pnpm -F @player.style/<name> typecheck`; `pnpm lint` and `pnpm format` before handing back.
- Edit only `skins/<name>/` (and `skins/<name>-live/`), `docs/porting/friction/<name>.md`, `docs/porting/screens/<name>*.png`, and your entries in
  `apps/skin-compare/src/skins.ts`. Do not touch `friction-log.md`, `best-practices.md`, root `package.json`, or
  `scripts/build-skin` unless your brief says so; the rollup is a separate pass.
- Do not commit; the planning agent commits.
