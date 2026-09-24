# essentials — friction log

> **Renamed 2026-09-24.** The port of the classic `minimal` theme ships as **Essentials** (`skins/essentials`,
> `@player.style/essentials`, `<essentials-skin>`, `EssentialsSkin`, root class `ps-essentials`) so it does not collide
> with the Video.js 10 first-party Minimal skins. The Media Chrome edition stays published as `@player.style/minimal`,
> which is what the harness still loads as the original. Entries below predate the rename and use the old name.

Port of `themes/minimal` (Media Chrome edition 0.2.1, "Minimal" by @muxinc; not Video.js 10's own first-party Minimal
skins) to `skins/essentials`. Based on [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the
initial markup and CSS (`apps/sandbox/templates/player-style-minimal/theme.html`, `theme.css`).
Date: 2026-09-24. Composite: [`../screens/essentials.png`](../screens/essentials.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Minimal is the smallest theme in the catalogue: one rounded bar, no menus, no tooltips (the theme sets
`--media-tooltip-display: none`), no hover chrome (`--media-control-hover-background: transparent`), invisible range
thumbs (`--media-range-thumb-opacity: 0`). Its one structural feature is that it rendered a *different control set per
breakpoint* through `<template if="breakpointsm">` / `<template if="breakpointmd">`. The port measures box-for-box
identical to the original at 360/720/1080 in both editions (bar, every button, both slider tracks, time display and
preview chip, to the tenth of a pixel).

## Scope

In: the on-demand bar with both control sets (below 384px: play, time range, mute, captions, fullscreen; from 384px:
opt-in seek pair, volume range, AirPlay, Cast, opt-in PiP; from 576px: elapsed time), the four bar sizes (30/38/46px
tall, 4/8px radius, 2/5/7px inline padding, 5/8px margin), time-range preview time (transparent box, text shadow),
storyboard thumbnail (untested), title in the top chrome (`media-title` / `Title`), media-chrome's default loading
indicator (`noautohide`) and error dialog, the three opt-in controls behind their media-chrome custom properties,
autohide, hotkeys, tap gesture, poster slot, `--media-accent-color`.

Out: the live layout (`streamtype == 'live'`, both `targetlivewindow` branches, `media-live-button`), as for microvideo:
v10 puts live on the `live-video` preset and does not reflect `targetLiveWindow`. The `defaultsubtitles`,
`defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` host attributes (player options in v10, not skin markup).
The `[disabled]` 60% opacity is ported onto `data-disabled`/`aria-disabled`.

## Entries

1. **Per-breakpoint control sets become container queries** — workaround. media-chrome stamped a different subtree per
   breakpoint; a v10 skin is one static tree, so every control is always present and `@container ps-essentials` rules
   decide which show. Hidden controls use `display: none`, so they also leave the tab order and accessibility tree,
   which is the behaviour the original's absent nodes had. Cost: every width-gated control needs a default `display:
   none` plus a container-query `display`, and the `[data-hidden]`/`[data-availability]` rule has to out-rank both (it
   sits last and carries an extra attribute selector). #2714 did the same with `ps-wide-only`/`ps-mid-only` helper
   classes; the port keys the rules on the control classes instead so the React edition needs no extra class names.
   Not upstream-worthy on its own; a `data-breakpoint` attribute on `media-container` would let skins avoid naming the
   container, but container queries are the right primitive.
2. **Opt-in controls inside a breakpoint** — papercut. The seek pair and PiP are both width-gated and opt-in
   (`display: var(--media-control-display, var(--media-seek-backward-button-display, none))`). The opt-in rule can only
   live inside the `>= 384px` query; outside it the controls are `display: none` whatever the property says, matching
   the original, where the nodes did not exist below `breakpointsm`. #2714 collapsed the two seek properties into one
   `--media-seek-button-display`; the port keeps both original names so existing integrations keep working.
3. **The theme's transparent control background also hides the preview box** — papercut. `--media-control-background:
   transparent` feeds media-chrome's `--media-preview-background`, so the scrub preview is bare text with media-chrome's
   `text-shadow: 0 0 4px rgb(0 0 0 / .75)`, and its 5px arrow is invisible but still spaces the chip 10px above the bar
   (5px box margin + 5px arrow). The port writes `margin-bottom: 10px` on `.ps-preview` and no background. Found by
   walking the live original's shadow roots; the theme's CSS alone does not show it.
4. **Two text colours** — papercut. The theme sets `--media-icon-color` to its primary (`#fff`) but leaves text on
   media-chrome's `rgb(238 238 238)` default (`media-control-bar` colour), so the port has `--ps-primary` (icons, fills)
   and `--ps-text` (time, preview, title). Both follow `--media-accent-color`, as both followed `--media-primary-color`
   in the original; `--media-text-color` still overrides text alone.
5. **media-chrome's bold button font leaks into the seek glyph's number** — papercut. The `<text>10</text>` inside the
   seek icon inherits `font-weight: bold` from media-chrome's button `font` shorthand; v10 buttons inherit the skin's
   normal weight. The port sets `font-weight: bold` on `.ps-seek-value` (microvideo renders its number at normal
   weight and could take the same fix).
6. **Buffered bar differs in the harness, not in the theme** — papercut. The original's `#buffered` stays at 0px in
   every capture: media-chrome's `mediabuffered` attribute is empty although the test video reports `buffered`
   `[[0, 10]]`, so the progress event evidently fires before the controller attaches. v10 reports the buffer and the
   port draws it with the theme's own `--media-time-range-buffered-color` (`rgb(255 255 255 / .4)`). This is most of
   the remaining pixel difference in the idle/hover columns; expected, not a port bug.
7. **Range padding moves from inside the range to a margin** — papercut, as yt entry 14. media-chrome's range keeps
   `--media-control-padding` of dead space either side of its track inside a 100px box; v10's `--media-slider-fill`
   is a percentage of the slider root, so the root cannot carry padding. The port gives both sliders
   `margin-inline: var(--ps-control-padding)` and the volume slider `width: calc(100px - 2 * padding)`; the tracks land
   on the original's pixels. The hit area is 2–4px narrower per side than media-chrome's.
8. **`media-title` exists and maps the top chrome cleanly** — positive. The original's `videotitle`/`title` branches
   become `<media-title>` / `<Title>`, fed by the player's `content-title` attribute (HTML) or `title` prop (React), and
   hide themselves when empty. Verified in an extra-state capture against the original's `title` attribute: same
   position, size, and colour. Worth a line in best-practices (below).
9. **Single-glyph PiP** — positive. The original ships identical enter/exit artwork, so one SVG serves both states and
   no `data-pip` rule is needed. Low and medium mute glyphs are also identical; one `ps-icon-volume-low` covers both,
   as in microvideo.
10. **Autohide** — positive. `media-controls-content[data-visible]` with 0.25s in / 1s out reproduces media-chrome's
    `--media-control-transition-in/out`; the title fades with the bar because both sit in the same layer, as the
    original's top and bottom chrome both faded.
11. **Icon transcription** — papercut, avoided. The theme shares Mux's icon set with microvideo, but copying 16 long
    path strings by hand is error-prone; the port generated both editions' SVGs from `themes/minimal/template.html` with
    a throwaway script and let the parity test confirm the match.
12. **`SkinElement` still not exported, two packages with one name, container queries cannot match the container** — as
    microvideo entries 1, 2 and 4; nothing new. The bar sizes sit on `.ps-bar` inside the queries.
13. **Text antialiasing in the composite** — papercut, not fixed. The original's bar text renders with subpixel (LCD)
    antialiasing; the ports' text is greyscale, likely because `.ps-chrome` animates `opacity` and is composited. Glyph
    positions match; only the fringes differ. Cosmetic only; not investigated further.

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): the HTML edition hand-rolls the shadow root again (~60 lines).
- Named icon slots become CSS (#2714): every glyph renders, data attributes hide the wrong ones.
- v10 never forces `fill` (#2714): `.ps-icon` sets `fill: var(--ps-primary)`.
- Volume level on the mute button only (#2714): fine, the theme has one mute button.
- Breakpoints become container queries (#2714): with the extra cost of whole control sets per breakpoint (entry 1).
- Opt-in controls easy to miss (#2714): three here, each also width-gated (entry 2).
- `targetLiveWindow` not reflected (#2714): the live layout is out of scope.
- Buttons disagree about when to hide (#2714): the generic `[data-hidden], [data-availability=…]` rule covers all.
- media-chrome ships default icons, v10 does not (#2714): the loading spinner is media-chrome's, inlined.

## Time sinks

- Reading media-chrome's range, time-range, text-display and button styles to pin control padding, range width and
  the preview offset (entries 3, 7), then confirming with a shadow-root measurement script: about half the port.
- One composite run died on "waiting for element to be stable" while extra-state scripts shared the CPU; rerun alone.

## Not verified

- Storyboard thumbnails (no storyboard in the test media); CSS ported from the theme's `--media-preview-thumbnail-*`.
- Captions, AirPlay, Cast and PiP states with real tracks and devices (headless Chromium hides them); glyph switching
  is CSS-only and covered by the parity test. The opt-in seek and PiP buttons were checked in an extra-state capture
  (all three panes) with the custom properties set.
- React title (the harness cannot pass `VideoPlayer title`); the HTML title was checked against the original.
- The error dialog's look against media-chrome's default dialog; copied from microvideo's port.
- Keyboard focus rings.

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composites: [`../screens/essentials.png`](../screens/essentials.png) (on-demand),
[`../screens/essentials-live.png`](../screens/essentials-live.png) (live edition, original rendered with
`streamtype="live"`). Layout: the live edition is a sibling package, `skins/essentials-live`
(`@player.style/essentials-live`, `<essentials-live-skin>`, `EssentialsLiveSkin`), with its own `src/html/*`,
`src/react/index.tsx` and tests; it has no stylesheet of its own and inlines, copies and tests
`skins/essentials/src/skin.css` (`build-skin`'s `stylesheet` option, a `?inline` import from
`../../../essentials/src/skin.css`). Both roots carry `class="media-skin ps-essentials" data-theme="essentials"`; the
live one adds `data-preset="live-video"`, which every live-only rule in the shared stylesheet keys on. Build output per
package: `dist/html.js`, `dist/react.js`, `dist/skin.css` (identical files), `dist/types/{html,react}/index.d.ts`,
`dist/open/`.

### Templates (26: 12 partials, 14 conditionals)

| # | Template | Ported as |
| --- | --- | --- |
| 1 | `partial="PlayButton"` | `media-play-button` / `PlayButton`, on-demand package only: the original's live bar never rendered it (tap gesture and `Space` / `k` toggle playback there). |
| 2 | `partial="MuteButton"` | `media-mute-button` / `MuteButton`, both packages; the medium glyph is the low one, as in the original. |
| 3 | `partial="CaptionsButton"` | `media-captions-button` / `CaptionsButton`, both packages. |
| 4 | `partial="FullscreenButton"` | `media-fullscreen-button` / `FullscreenButton`, both packages. |
| 5 | `partial="LiveButton"` | `media-live-button` / `LiveButton` in the live package, with the theme's own `Live` text (`font-weight: normal`, uppercased) and 8×8 `rx="2"` square (`margin-right: 2px`); media-chrome's `spacer` slot (`&nbsp;` in the bold button font) is a `::before` on the text. |
| 6 | `partial="PipButton"` | `media-pip-button` / `PiPButton`, both packages, opt-in through `--media-pip-button-display` (from 384px on demand, every width live, as the original's branches had it). One glyph: enter and exit artwork are identical. |
| 7 | `partial="SeekBackwardButton"` | `media-seek-button seconds="-10"` / `SeekButton`, on-demand only, opt-in through `--media-seek-backward-button-display`. `backwardseekoffset` is a scope cut (below). |
| 8 | `partial="SeekForwardButton"` | `media-seek-button seconds="10"` / `SeekButton`, as 7, with `forwardseekoffset` cut. |
| 9 | `partial="AirplayButton"` | `media-airplay-button` / `AirPlayButton`, both packages. |
| 10 | `partial="CastButton"` | `media-cast-button` / `CastButton`, both packages. |
| 11 | `partial="TimeRange"` | `media-time-slider` with preview / `TimeSlider.*`, on-demand only. |
| 12 | `partial="VolumeRange"` | `media-volume-slider` / `VolumeSlider.*`, both packages (from 384px on demand, every width live). |
| 13 | `if="videotitle"` | `media-title` / `Title`, fed by the player's `content-title` attribute or `title` prop, hidden when empty (round 1). |
| 14 | `if="videotitle != true"` (in 13) | Folded into 13: the guard against a boolean `videotitle` attribute has no counterpart when the title is a string on the player. |
| 15 | `if="!videotitle"` | Folded into 13: v10 has one title source, so the `videotitle` / `title` alias pair collapses. |
| 16 | `if="title"` (in 15) | Folded into 13. |
| 17 | `if="streamtype == 'on-demand'"` | The on-demand package, `@player.style/essentials`, `data-preset="video"`. |
| 18 | `if="!breakpointsm"` (small bar: play, range, mute, captions, fullscreen) | The default state of the on-demand stylesheet: the seek pair, volume, AirPlay, Cast, PiP and time are `display: none` outside the container queries (round 1, entry 1). |
| 19 | `if="breakpointsm"` (full bar) | `@container ps-essentials (inline-size >= 384px)` (round 1). |
| 20 | `if="breakpointmd"` (time display, in 19) | `@container ps-essentials (inline-size >= 576px)` (round 1). |
| 21 | `if="streamtype == 'live'"` | The live package, `@player.style/essentials-live`, `data-preset="live-video"`. |
| 22 | `if="!targetlivewindow"` (time display beside the badge, in 21) | The live package's layout: `.ps-live-left` holds the badge and `media-time type="current"`; the live-video preset is the original's `!targetlivewindow` case. |
| 23 | `if="breakpointsm"` (in 22) | `@container ps-essentials (inline-size >= 384px) { .ps-essentials[data-preset="live-video"] .ps-time { display: inline-flex } }`. |
| 24 | `if="targetlivewindow > 0"` (time range, in 21) | Scope cut: DVR (below). |
| 25 | `if="breakpointsm"` (in 24) | Scope cut with 24. |
| 26 | `if="targetlivewindow > 0"` (seek pair, in 21) | Scope cut: DVR (below). |

### Scope cuts

1. **DVR layout** (templates 24–26: `targetlivewindow > 0` adds the time range from `breakpointsm` and the seek pair
   to the live bar). v10 exposes no target live window to a skin: `media-container` reflects only
   `data-controls-visible`, and `media-live-button` only `data-live` / `data-live-edge` / `data-disabled`, which
   cannot tell low-latency live from DVR. The live-video preset's own skins drop the time slider too. A DVR edition
   would need a third package or a reflected `data-live-window` to switch layouts on. Same cut as microvideo.
2. **Theme parameters** `disabled` (bound to every partial's `disabled` / `aria-disabled` and to `gesturesdisabled`),
   `hotkeys`, `nohotkeys`, `defaultsubtitles`, `defaultduration`, `backwardseekoffset`, `forwardseekoffset`, and the
   `videotitle` alias of `title`. They were Media Chrome template inputs, not layout branches: v10 puts `disabled` on
   individual buttons, hotkeys are elements in the tree (remove them in the open edition), default subtitles and
   duration are player features, the seek offset stays at the original's default of 10s (which the glyph's text
   repeats), and the title comes from the player. None of them is a host variant (below).
3. **`--media-secondary-color` without `color-mix()`.** The original fell back to `rgb(0 0 0 / .75)` in browsers
   without `color-mix()`; every browser with container queries has it, so the port keeps one declaration.
4. **Media Chrome tokens with nothing to paint in v10.** The theme set `--media-range-thumb-opacity: 0` and
   `--media-range-thumb-background` (the port draws no thumb), `--media-tooltip-display: none` (no tooltips),
   `--media-control-hover-background: transparent` (no hover chrome) and `--media-control-background: transparent`
   (its one visible effect, the bare preview chip, is ported as no background). Setting them on the port does nothing;
   they are left out of the README.

### Host variants

None. The original has no `:host([attr])` rules and no layout switch of microvideo's `controlbarplace` kind: its
parameters (`title`, `disabled`, `hotkeys`, `nohotkeys`, `defaultsubtitles`, `defaultduration`, the seek offsets)
are template inputs that map to the player (`content-title` / `title`), to per-button state, or to nothing (scope cut
2). The one parameter that changes layout, `title`, already reaches the skin through `media-title` (round 1, entry 8),
so the elements observe no attributes and the components take only `ContainerProps`.

### Theming tokens

`--media-primary-color` (default `#fff`) and `--media-secondary-color` (`#000`, drawn at 75% through `color-mix()`)
keep the original's roles and defaults. The brand colour is
`--ps-primary: var(--media-accent-color, var(--media-primary-color, #fff))`, so the accent overrides the primary
everywhere it paints (icons, slider fills, dialog button, and the text through `--ps-text`'s fallback chain); the
original never read `--media-accent-color`. The Media Chrome element tokens the theme set on its host are honoured
with the theme's values as defaults, since an inline override on the theme element used to win over its `:host` rule:
`--media-icon-color` (glyphs and spinner), `--media-range-bar-color` (fills), `--media-range-track-background`
(`rgb(255 255 255 / 0.5)`), `--media-time-range-buffered-color` (`rgb(255 255 255 / 0.4)`),
`--media-preview-thumbnail-border-radius` (`2px`), plus `--media-text-color` and `--media-font-family` from round 1.
The live badge reads media-chrome's `--media-live-button-icon-color` (`rgb(140 140 140)`) and
`--media-live-button-indicator-color` (`rgb(255 0 0)`). Both READMEs list them; both test files assert the root
declaration.

### Reduced motion

The original has no `prefers-reduced-motion` rules (neither does media-chrome 4.x); its motion is the 0.25s / 1s bar
fade, the preview chip's 0.25–0.5s fade and the SMIL spinner. The port keeps exactly that and adds no media query; the
on-demand test asserts the stylesheet has none.

### Live layout

The original's live bar is `[.live-controls-left: LiveButton, (sm) TimeDisplay] [margin-right: auto]
[.live-controls-right: Mute, VolumeRange, Captions, AirPlay, Cast, PiP, Fullscreen]`, in the same 30/38/46px bar as
on demand. Ported one to one: `.ps-live-left` / `.ps-live-right` are flex groups stretched to the bar's height,
`margin-right: auto` on the left one. Differences from the on-demand bar that needed preset-keyed rules: the volume
range, AirPlay and Cast show at every width (the live branch had no `!breakpointsm` variant), PiP's opt-in rule applies
at every width, and the time shows from 384px instead of 576px. The seek hotkeys are dropped with the seek buttons.

One thing the theme's CSS does not show: the original's groups were plain blocks, so the whitespace between their
inline-flex children rendered as one collapsed space per boundary in the page's inherited font (4px at the default
16px serif, since `media-container` sets `line-height: 0` the space adds no height). The port's flex groups carry
`column-gap: 4px` for it; found by dumping the live original's boxes (right group 172px = 32 + 4 + 100 + 4 + 32 at
720px), not by reading the template.

### New v10 gaps

1. **No target live window / DVR state** — blocker for the DVR branch (scope cut 1). Element: `media-container` and
   `media-live-button`. Expected a reflected attribute a skin could key a layout on; found `data-live` /
   `data-live-edge` on the button only. Same as microvideo round 2, item 1.
2. **Live badge disabled state on non-live media** — papercut. Element: `media-live-button`, attributes
   `data-disabled` and `aria-disabled="true"`. With on-demand media in a `<live-video-player>` (the harness) the
   badge reads as disabled, so the generic disabled rule excludes `.ps-live-button`, as the original's
   `[disabled]:not(media-live-button)` did. Expected: the badge to hide itself or stay neutral off a live stream;
   actual: it never hides, and reads disabled until the media is live.
3. **`media-time` on a live stream** — papercut, not a bug. Element: `media-time type="current"`. The original's live
   bar kept a `media-time-display`, which showed `mediacurrenttime` against a live stream (seconds since the player's
   first playlist). v10's element shows the same `currentTime`, padded to the seekable end, and adds
   `data-unavailable` until the media reports a time range, where media-chrome showed `0:00`. The port keeps the
   display and lets the attribute through unstyled; a skin that wants media-chrome's `0:00` can style
   `.ps-time[data-unavailable]`.
4. **`SkinElement` still not exported** (round-1 known gap) — the hand-rolled shadow-root host is now duplicated across
   the two packages (`skins/essentials/src/html/index.ts`, `skins/essentials-live/src/html/index.ts`, ~60 lines each),
   because a sibling package cannot share a module without importing the other package's sources. A `SkinElement`
   with `static template` would leave each entry at its imports and a tag name.
5. **Live-button text** — positive. `LiveButtonElement` and `LiveButton` keep authored children and only inject the
   translated badge when empty, so the theme's `Live` text and indicator port one to one, and the 8px square keeps its
   size because v10 forces no dimensions on the children.

### Packaging notes

- The live package has no `src/skin.css`; `vite.config.ts` passes `stylesheet: '../essentials/src/skin.css'` and the
  HTML entry imports `../../../essentials/src/skin.css?inline`. Its `dist/skin.css` and `dist/open/skin.css` are
  byte copies of the on-demand file. A page that imports both packages' `skin.css` loads the same rules twice
  (harmless: same selectors, same values).
- `skins/essentials-live/tests/skin.test.ts` reads the shared stylesheet and the on-demand template from
  `../essentials`, so a change to either package runs both test suites' parity checks; it also asserts the live
  template's icon paths are a subset of the on-demand ones.

### Visual check

- On-demand composite: unchanged from round 1 (the token indirection through `--ps-icon` / `--ps-fill` / `--ps-track`
  / `--ps-buffered` and the higher-specificity hidden rule moved nothing).
- Live composite: badge, time, volume, fullscreen and bar match the original at 360/720/1080 in every state, no
  console errors in any pane. Box dump after the gap fix (same numbers in both ports): 360px, left group 7/48.3,
  right group 189/164, mute 189, volume box 221–321 with the track at 223–319, fullscreen 325; 720px, left group
  13/91.5 with the time at 69.3, right group 535/172; 1080px, left 15/91.5, right 893/172. The badge's visible text
  ends at the same x (53.3) although the port's span starts 3.9px earlier: the `::before` spacer sits inside the span
  where media-chrome's sat in its own slot. The only remaining differences are the original's subpixel text fringing
  and the harness's play-time drift between panes.
- Accent column: the ports recolour the glyphs, the `LIVE` text, the volume fill and the elapsed time with
  `--media-accent-color: #f5c518`; the original does not, as it never read the accent (round-2 convention).
- The port's `.ps-live-left` / `.ps-live-right` and the volume slider stretch to the bar's height (30/38/46px) where
  the original's groups were 28/32px tall; children sit at the same y, and the taller slider only widens its hit
  zone, as in the on-demand port.

### Not verified

- The live edge itself (red square, `aria-disabled` and `not-allowed` at the edge, seek-to-live on press): headless
  Chromium plays no HLS, so the composite shows the grey square on a WebM in every pane. Needs a manual check against
  a Mux live stream.
- `media-time` against a real live stream (what number it shows and when `data-unavailable` clears).
- Captions, AirPlay, Cast and PiP in the live bar with real tracks and devices; the markup and CSS are the on-demand
  ones.
