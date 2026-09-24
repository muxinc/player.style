# microvideo — friction log

Port of `themes/microvideo` (Media Chrome edition 0.2.0) to `skins/microvideo`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS.
Date: 2026-09-23. Composite: [`../screens/microvideo.png`](../screens/microvideo.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

## Entries

1. **Two workspace packages with one name** — workaround. `themes/microvideo` and `skins/microvideo` are both
   `@player.style/microvideo`; pnpm tolerates it, Vite+ `run` refuses to build a task graph. Excluded the ported theme
   from `pnpm-workspace.yaml` (`!themes/microvideo`); the root's pinned `0.2.0` devDependency then resolves from npm.
   Not a v10 gap. Every port added one exclusion line until round 2 removed the legacy tree from `main` (the sources
   stay on the `media-chrome` branch).
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
8. **No stream-type branches** — deliberate scope in round 1, ported in round 2 as the live edition (below). The
   `targetlivewindow > 0` branch stays out: v10 reflects no target live window.
9. **`controlbarplace` / `controlbarvertical` host attributes** — deliberate scope in round 1, ported in round 2 as
   host variants (below): attributes on the element, props on the component, both mirrored to data attributes on the
   container so the two editions share one set of CSS rules after all.
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

## Round 2

Date: 2026-09-24. Composites: [`../screens/microvideo.png`](../screens/microvideo.png) (on-demand),
[`../screens/microvideo-live.png`](../screens/microvideo-live.png) (live edition, original rendered with
`streamtype="live"`). Layout: `skins/microvideo` (on-demand: `src/skin-element.ts`, the shadow-root host,
`src/html/*`, `src/react/index.tsx`, `src/skin.css`) and `skins/microvideo-live` (live: its own copy of
`src/skin-element.ts` importing `../../microvideo/src/skin.css`, `src/html/*`, `src/react/index.tsx`, no stylesheet of
its own). Each builds the ordinary `dist/html.js`, `dist/react.js`, `dist/types/{html,react}/index.d.ts`, `dist/skin.css`
(the same file in both) and `dist/open/`.

Live edition moved (2026-09-24, same day): first built as `@player.style/microvideo/live` and `/live/react` from this
package, then split into the sibling package `@player.style/microvideo-live` once Darius settled on naming live
editions like first-party skins. Nothing changed in markup, CSS or behaviour; the harness entry `microvideo-live` now
loads `skins/microvideo-live/src/*`.

### Templates (16: 12 partials, 4 conditionals)

| Template | Ported as |
| --- | --- |
| `partial="PlayButton"` | `media-play-button` / `PlayButton`, on-demand edition only (the live branch dropped it). |
| `partial="SeekBackwardButton"`, `partial="SeekForwardButton"` | `media-seek-button seconds="±10"` / `SeekButton`, on-demand edition, opt-in through `--media-seek-*-button-display` as in the original. The `backwardseekoffset` / `forwardseekoffset` theme parameters are a scope cut (below). |
| `partial="MuteButton"` + `partial="VolumeRange"` | `media-mute-button` + `media-volume-slider`, both editions; the vertical host variant turns the slider vertical. |
| `partial="CaptionsButton"`, `partial="AirplayButton"`, `partial="CastButton"`, `partial="PipButton"`, `partial="FullscreenButton"` | The matching v10 buttons, both editions. |
| `partial="LiveButton"` | `media-live-button` / `LiveButton` with its own `Live` text and a 6×12 circle glyph, leading `.ps-bar` in the live edition. |
| `partial="TimeRange"` | `media-time-slider` with preview, on-demand edition only. |
| `if="streamtype == 'on-demand'"` | The on-demand edition: `<microvideo-skin>` / `MicrovideoSkin`, `data-preset="video"`. |
| `if="streamtype == 'live'"` → `if="!targetlivewindow"` | The live edition: `<microvideo-live-skin>` / `MicrovideoLiveSkin`, `data-preset="live-video"`, published as `@player.style/microvideo-live`. The centred layer loses its 6px bottom padding as the original's `:host([streamtype=live]:not([targetlivewindow]))` rule did. |
| `if="streamtype == 'live'"` → `if="targetlivewindow > 0"` | Scope cut (below). |

### Scope cuts

1. **DVR layout** (`targetlivewindow > 0`: live badge plus the full on-demand controls and scrubber). v10 exposes no
   target live window to a skin: `media-container` reflects only `data-controls-visible`, and `media-live-button` only
   `data-live` / `data-live-edge` / `data-disabled`. The live-video preset's own skins drop the time slider too. A
   DVR edition would need either a third element or a reflected `data-live-window` to switch layouts on.
2. **Theme parameters** `disabled`, `hotkeys`, `nohotkeys`, `defaultsubtitles`, `defaultduration`,
   `backwardseekoffset`, `forwardseekoffset` (the `{{…}}` bindings on the partials and on `media-controller`). They
   were Media Chrome template inputs rather than layout branches: v10 puts `disabled` on individual buttons, hotkeys
   are elements in the tree (remove them in the open edition), default subtitles and duration are player features, and
   the seek offset stays at the original's default of 10s, which the glyph's text repeats. Not host variants.
3. **Volume-open bar offset** (`media-control-bar:has(.volume-group:hover) { top; left }` and the
   `--_control-bar-offset-*` variables the place/vertical variants set). Every value was `- var(--x)`, invalid at
   computed-value time, so the original never moved the bar; the port ports the effect (no movement).
4. **`--media-secondary-color` without `color-mix()`.** The original fell back to `rgb(0 0 0 / .75)` in browsers
   without `color-mix()`; every browser with container queries has it, so the port keeps one declaration.

### Host variants

`controlbarplace` and `controlbarvertical` are attributes on both elements (`observedAttributes`, with
`controlBarPlace` / `controlBarVertical` properties) and props on both components. The element mirrors them onto the
`.ps-microvideo` container as `data-controlbar-place` / `data-controlbar-vertical`; React sets the same data
attributes; the stylesheet keys on those, so the open edition sets them by hand (its header comment says so).

| Original rule | Port |
| --- | --- |
| `style="--_control-bar-place-self: {{controlbarplace ?? 'unset'}}"`, `place-self: var(--_control-bar-place-self, end center)` | The value is a `place-self` pair, read with the original's own `^=` / `$=` selectors: `[data-controlbar-place^="start"\|"center"]` sets `align-self`, `[$="start"\|"end"]` sets `justify-self`; the round-2 shorthands `top`, `center`, `bottom` map to `start center`, `center center`, `end center`. |
| `:host([controlbarplace$="end"]) media-control-bar { align-items: end }` | Same, on `.ps-bar`. |
| `:host([controlbarplace$="end"]) .volume-group:first-child .volume-range-span { --_volume-range-padding-left: 10px }` | The leading volume group (live edition) opens with `padding-left: 10px` and 10px more width (the original span was content-box). |
| `:host([controlbarvertical]) :is(media-control-bar, .control-group) { flex-direction: column; width: 40px }` | Same, on `.ps-bar` / `.ps-group`. |
| `:host([controlbarvertical]) .volume-group { flex-direction: column }`, `[controlbarplace^="end"]` → `column-reverse`, `--_volume-range-padding-top: 10px` on the first group | Same; `bottom` counts as `end`. |
| `:host([controlbarvertical]) .volume-range-span { height: 0 }` → `height: 42px; width: auto; max-width: 40px` on hover | Same. |
| `:host([controlbarvertical]) media-volume-range { width: 42px; transform: rotate(-90deg) }` | No transform: the element sets `orientation="vertical"` on the slider (React passes the prop), the track is 4×42px and the fill grows from the bottom. See gap 2. |
| `[keyboardcontrol] .volume-group:focus-within` | `.ps-volume:has(:focus-visible)`: v10 has no keyboard-control flag; `:focus-visible` gives the same "opened by keyboard, not by click" behaviour. |

### Theming tokens

`--media-primary-color` (default `rgb(255 255 255 / 0.9)`) and `--media-secondary-color` (`#000`, drawn at 75%
through `color-mix()`) keep the original's roles and defaults. The brand colour is
`--ps-primary: var(--media-accent-color, var(--media-primary-color, rgb(255 255 255 / 0.9)))`, so the accent
overrides the primary everywhere it paints (icons, fills, live badge text, dialog button); the original never read
`--media-accent-color`. Media-chrome's live-button tokens `--media-live-button-icon-color` (`rgb(140 140 140)`) and
`--media-live-button-indicator-color` (`rgb(255 0 0)`) colour the badge's dot behind and at the live edge. The README
lists all of them; `tests/skin.test.ts` asserts the root declaration.

### Reduced motion

The original has no `prefers-reduced-motion` rules (neither does media-chrome 4.x), and its motion is a 0.2s volume
slide, a 0.1s track-height transition and the SMIL spinner. The port keeps exactly that and adds no media query; the
test asserts the stylesheet has none.

### New v10 gaps

1. **No target live window / DVR state** — blocker for the DVR branch. Element: `media-container` and
   `media-live-button`. Expected a reflected attribute (`data-live-window`, `data-stream-type`, or `data-dvr`) a skin
   could key a layout on; found `data-live` / `data-live-edge` on the button only, which cannot distinguish low-latency
   live from DVR. Result: one live edition (the `!targetlivewindow` layout), DVR cut.
2. **A CSS-rotated slider does not remap the pointer** — workaround. Element: `media-volume-slider` (and
   `VolumeSlider.Root`). Expected `transform: rotate(-90deg)` to keep working as it did on media-chrome's native
   `<input type="range">`; found `getPercentFromPointerEvent` reads `clientX` against the root rect unless
   `orientation="vertical"`. A host variant therefore needs JS in both editions (the element's
   `attributeChangedCallback` sets the attribute, React passes the prop) instead of a CSS-only rule, and the open
   edition's users must set `orientation` themselves.
3. **No keyboard-control flag** — papercut. media-chrome's `media-container[keyboardcontrol]` let a theme open the
   volume slider on keyboard focus only. `:has(:focus-visible)` covers it; noting it because `:has()` is the only way.
4. **Live badge disabled state on non-live media** — papercut. With on-demand media in a `<live-video-player>`
   (the harness, or a page that reuses the live skin for a VOD fallback) `media-live-button` sets `data-disabled` and
   `aria-disabled="true"`, so the generic disabled rule had to exclude the badge, as the original's
   `[disabled]:not(media-live-button)` did. Fine, but worth knowing: the badge never hides itself.
5. **`SkinElement` still not exported** (round-1 item 2) — the hand-rolled host grew to ~120 lines with the
   attribute mirroring and is now shared by two entries (`src/skin-element.ts`, emitted as a hashed chunk). A
   `SkinElement` with `static template` and `observedAttributes` support would remove it.
6. **Live-button text** — positive. `LiveButtonElement` and `LiveButton` keep authored children and only inject the
   translated badge when empty, so the theme's own `Live` text and indicator markup port one to one.

### Visual check

- On-demand composite: unchanged from round 1 (the padding split into block/inline tokens and the
  `:has(:focus-visible)` swap moved nothing).
- Live composite: badge, cluster and layer padding match the original at 360/720/1080 in every state, no console
  errors in any pane. A 4× crop of the 360px badge shows the dot, the gap, the `LIVE` text and the button padding at the
  same pixels; the only difference is the original's subpixel colour fringing on the text.
- Host variants (probe script, both editions, both panes): `center center` puts the 114px bar at (279, 172) in a 640px
  stage, `start end` at (532, 26), `top` at (279, 26); `controlbarvertical` gives a 40px column with a 40×42 slider
  and a 4×42 track, `orientation="vertical"` set; `end start` + vertical lands at (26, 234). In the live edition the
  badge overflows the 40px column, as the original's did.

### Not verified

- The live edge itself (red dot, `aria-disabled` at the edge, seek-to-live on press): headless Chromium plays no HLS,
  so both composites show the badge behind the edge on a WebM. Needs a manual check against a Mux live stream.
- The host variants have no harness state; checked by hand in the dev harness (`?skin=microvideo&w=640` with the
  attributes set from the console) and by the CSS/source tests, not by a composite.
