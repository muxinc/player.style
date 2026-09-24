# microvideo — friction log

Port of `themes/microvideo` (Media Chrome edition 0.2.0) to `skins/microvideo`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS.
Date: 2026-09-23. Composite: [`../screens/microvideo.png`](../screens/microvideo.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

## Entries

1. **Two workspace packages with one name** — workaround. `themes/microvideo` and `skins/microvideo` are both
   `@player.style/microvideo`; pnpm tolerates it, Vite+ `run` refuses to build a task graph. Excluded the ported theme
   from `pnpm-workspace.yaml` (`!themes/microvideo`); the root's pinned `0.2.0` devDependency then resolves from npm.
   Not a v10 gap. Every port adds one exclusion line.
2. **`SkinElement` is not exported** — workaround. The HTML edition hand-rolls what `packages/html/src/presets/skin.ts`
   does: `attachShadow`, one shared `CSSStyleSheet`, a cloned `<template>`, and a `:host { display: block }` style.
   Worth filing: exporting `SkinElement` (or its `createShadowStyle`/`renderTemplate` helpers) from `@videojs/html`
   would remove ~40 lines per skin.
3. **`'use client'` bundling** — papercut. Rolldown warns that the directive "may not be preserved" but keeps it; a
   `banner` doubled it. `build-skin` now silences `MODULE_LEVEL_DIRECTIVE` and relies on rolldown keeping it.
4. **Container queries cannot match the container** — papercut. The theme's `[breakpointsm] { --media-control-padding }`
   sits on the controller; the port sets the property on `.ps-bar` inside the query. Same for every theme.
5. **Invalid declarations were load-bearing** — papercut, the longest read of the port. The theme's
   `--media-control-padding: 5px 5px` becomes `padding-left: 5px 5px` in `media-chrome-range` (dropped → no gap) and
   `height: calc(24px + 2 * 5px 5px)` (dropped → the volume range stretches to its flex row). The port writes the
   resulting layout directly. Read `node_modules/media-chrome/dist/*.js` before trusting a theme's variables.
6. **Volume level is reported on the mute button only** (v10, as #2714 noted) — fine here since the theme has one; the
   `medium` level borrows the `low` glyph as the original does.
7. **Preview offset** — papercut. `media-slider-preview` measures from the slider root; the original's preview box
   measures from a range whose box starts 5px higher, so the port adds 5px of margin to land the time chip in the same
   place.
8. **No stream-type branches** — deliberate scope. The original renders a live layout (`streamtype == 'live'`, with and
   without a target live window). v10 puts live on the `live-video` preset with no reflected `targetLiveWindow`
   attribute (v10#2714 README). Not ported; a `microvideo-live` skin can follow.
9. **`controlbarplace` / `controlbarvertical` host attributes** — deliberate scope. Theme-level layout variants; not
   ported. They would be `:host([controlbarvertical])` rules on the HTML side and a prop on the React side, which is
   the one place the two editions would diverge. Revisit if a consumer asks.
10. **Autohide** — positive. `media-controls` hides only while playing and after the same idle delay Media Chrome uses,
    with no configuration; `data-controls-visible` on the container also gives `cursor: none` for free.
11. **Poster** — positive. `<media-poster><slot name="poster"><img></slot></media-poster>` handles a slotted `<img>`
    through two slots, and `Poster.Root` + `VideoPlayer poster` does the same in React, with `data-visible` for hiding.
12. **Dedupe of `@videojs/react`** — positive, but worth checking each time. pnpm resolved the site's and the skin's
    `@videojs/react` to one store path (dedupe-peer-dependents), so the skin's components find the site's player
    context; the harness adds `resolve.dedupe` for its source imports anyway.
13. **Cast button availability** (v10#2714 known gap) — the port hides `data-availability="unavailable"` as well as
    `unsupported`, matching Media Chrome's `mediacastunavailable`; nothing to do per skin.

## Time sinks

- Reading media-chrome's element defaults to reproduce sizes (≈ a third of the port).
- Harness plumbing that is now shared: Playwright proxying loopback through the sandbox proxy
  (`PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK`), trusting the proxy CA by SPKI hash, generating WebM without
  `lavfi` (frames rendered in Chromium, encoded by Playwright's ffmpeg).

## Not verified

- Storyboard thumbnails (`media-slider-thumbnail`): the test media has none; the CSS is ported from the original's
  `--media-preview-thumbnail-*` values without a visual check.
- Captions, AirPlay, Cast, fullscreen, and PiP states: the buttons hide in headless Chromium for want of tracks and
  devices; the glyph switching is CSS-only and covered by the parity test.
- Keyboard focus rings and `focus-within` volume opening.
