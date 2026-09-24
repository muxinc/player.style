# x-mas — friction log

Port of `themes/x-mas` (Media Chrome edition 0.1.2, "X-mas" by @qualabs, 2024-12) to `skins/x-mas`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the class names and
layout (`apps/sandbox/templates/player-style-x-mas/theme.html`, `theme.css`); sizes were then re-measured on the live
original. Date: 2026-09-24. Composite: [`../screens/x-mas.png`](../screens/x-mas.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

X-mas is the catalogue's artwork-heaviest theme: a 204 KB template that is almost entirely inline Figma SVG. Two
garlands of fairy lights along the top edge, a bauble play button hanging on a wire (green with a play glyph, red with
a pause glyph, each with a second small bauble), a candy-cane progress fill with a Christmas-tree thumb, a candy-cane
volume stick with a bauble thumb, and festive mute/Cast/AirPlay/fullscreen glyphs whose bow, holly, or bauble swings
out on hover. 55 SMIL animations (`<animate>` on `d`, `opacity`, `x`/`y`, `fill-opacity`; two `<animateTransform>`
rotations) twinkle the lights and sway the baubles and wires.

## Scope

Inventory of the original (`template.html`, `site/themes/x-mas.md`):

- **Elements:** error dialog, `.gradient-bottom`, `top-chrome` (two garland SVGs over a dark fade), `centered-chrome`
  (one `media-play-button`, play and pause artwork), `media-control-bar` (`media-time-range` with preview thumbnail and
  preview time, mute with four level glyphs and a rotated `media-volume-range`, Cast, AirPlay, fullscreen). All in.
  The stylesheet also styles `media-time-display` and `media-captions-button`, which the template never renders; not
  ported.
- **Breakpoints:** `breakpoints="xs:360 sm:600 md:760 lg:960 xl:1100"`, but only `breakpointsm` is queried; one
  `@container ps-x-mas (inline-size >= 600px)` covers it. Measured pixel-equal at 599/600.
- **`:host([attr])` variants:** `[mediastreamtype=live]` hides the time range; out (live is v10's `live-video`
  preset, as in every port). No `<template if>` branches, no `{{partials}}`, no `base64()` calls: the artwork is inline
  SVG plus two SVG data URIs (tree and bauble thumbs) in the stylesheet.
- **`--media-*` properties:** `--media-primary-color: black` (media-chrome's icon `fill`; every shape carries its own
  fill, so it never shows), `--media-tertiary-color: var(--media-accent-color, #7596cc)` (range thumb background, which
  both thumbs' artwork overrides), `--media-text-color: white`, transparent control and hover backgrounds, range
  track/bar/thumb values, `--media-tooltip-display: none` (no tooltips, none ported). All reproduced as literal values;
  the accent is rewired (entry 3).
- **Controller attributes** (`defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`, `nohotkeys`): out, as
  in every port; media-chrome's default hotkey set is kept.

## Entries

1. **Artwork generated from the original template** — positive (minimal's recommendation, applied). A throwaway script
   parsed the 12 SVGs out of `themes/x-mas/template.html`, dropped Figma's ids and the `slot` attributes, renamed
   `#wire`/`.ornament` to `ps-wire`/`ps-ornament`, and wrote both `template.html` and JSX (`fill-rule` → `fillRule`,
   `style="mask-type: alpha"` → `style={{ maskType: 'alpha' }}`, an entity-only `style="&#10;"` dropped). The skin test
   checks all 199 paths and 55 animation value lists against the legacy template and between the editions. Each
   edition is ~160 KB of source (html.js 227 KB, react.js 181 KB unminified; 51/38 KB gzip), about the original's size.
2. **SMIL runs as-is in both editions** — positive. `<animate>` and `<animateTransform>` are plain SVG, so React
   renders them (camelCase attributes already) and the shadow-DOM template clones them. Each outermost `<svg>` is its
   own timeline starting when it is inserted, so animation phase differs between panes in every capture (sway of the
   wire, twinkle of a bulb); not a port difference.
3. **Accent wired to the candy canes** — deliberate deviation. The original's accent feeds a thumb background both
   thumbs' artwork covers, so its `accent-hover` column never changes. The port drives the red stripes of both fills
   with `--ps-primary: var(--media-accent-color, #e72d33)`. Checked in a scrubbed accent capture (t = 5s, volume open):
   both candy canes turn `#f5c518`/white in HTML and React, the original stays red.
4. **The original's centred chrome swallows the picture** — workaround. `div[slot=centered-chrome]` is 100% × 100%
   and takes pointer events, so (a) media-chrome's gesture receiver never sees a click on the video (its allow-list is
   `video`/`media-controller` targets): no click-to-pause; and (b) `media-container` never starts its idle timer while
   the pointer is over a slotted part, so with a mouse the chrome hides only on `mouseleave`. The port ships no
   `media-gesture`/`Gesture` (so the picture ignores clicks, as in the original), and keeps the layer opaque with
   `@media (hover: hover) { .ps-x-mas:hover .ps-layer:not([data-visible]) { opacity: 1 } }`; v10's own `mouseleave`
   → `setInactive` supplies the hide. Verified at 360 in all three panes: pointer resting 4s during playback keeps
   everything up; leaving hides it within the 1s fade. Touch keeps v10's 2s idle, which is what media-chrome's touch
   path did too. The v10 store still reports `userActive: false` while hovered (known gap 7's cousin).
5. **Rotated volume range → upright slider, rotated drawing** — workaround. The original rotates a 122px × 2rem
   wrapper by -90deg around a horizontal `media-volume-range`. v10 maps the pointer against the slider root's box
   (`dom/ui/slider`), so a rotated horizontal slider would map the wrong axis. The port keeps the wrapper's rotated box
   upright (`top: calc(-3.5rem - 61px); left: calc(-4rem + 61px)`, 2rem × 122px, same `opacity`-only hover), puts a
   `orientation="vertical"` slider on the 80px track, and draws the track horizontally with `rotate: -90deg` so the
   45deg stripes and the bauble thumb come out the same way round. A first pass with an upright track and a -45deg
   gradient had the right direction but stripes 3px out of phase and the bauble quadrants turned.
6. **Repeating-gradient phase follows the box** — papercut. With the same fill width the candy cane is pixel-identical
   (row dump at t = 5s); in the harness shots the stripes differ only because playback timing gives the fills different
   widths. The 45deg pattern's phase evidently depends on the box's size, not only on its corner, which is also why
   entry 5 draws the volume stripes on a box shaped like the original's.
7. **Thumb geometry from media-chrome's range** — positive, measured. media-chrome places `#thumb` at
   `left: fill` with the theme's `margin-left: -1rem` and a `margin-bottom` (1rem from 600px, -0.5rem below) inside a
   centred flex row, plus its default 10px corner radius. The port's `translate: calc(-50% - 1rem) calc(-50% ∓ …)` on a
   `media-slider-thumb` lands the tree on the original's pixels at 0%, 50% and at 599/600/720/1080, and keeps the tree's
   top-left anchoring inside the 1.4rem × 3rem box below 600px (`background: no-repeat` with no size, as the original).
8. **Preview box as wide as the empty thumbnail slot** — papercut. media-chrome's preview box is at least the
   thumbnail's 120px `min-width` even with no storyboard, which decides where it clamps. `.ps-preview` gets
   `min-width: 120px`; v10's clamp over the slider root then equals media-chrome's clamp over the range box less its
   10px box padding. The harness hovers 40% of each stack's range element, and the original's element includes the
   10px range padding, so its preview reads `0:03` where the ports read `0:04` (2px apart); a harness artefact.
9. **Mask ids in React** — workaround. The four speaker glyphs clip their stripes with `<mask id>`; ids are
   document-wide in React, and a mask inside a `display: none` glyph of another player would be what `url(#…)` finds.
   `VolumeIcons` suffixes each mask with `useId()` (sanitised to `[\w-]`); the HTML edition's shadow root scopes the
   original ids. Checked muted/low/medium/high in all three panes. Upstream-worthy only as a docs note.
10. **No `prefers-reduced-motion`** — papercut, parity kept. The original never checks it, and SMIL does not respond
    to CSS (`animation: none` does not stop `<animate>`); stopping it would take `SVGSVGElement.pauseAnimations()` from
    script. Kept as the original; noted in the README.
11. **Cast glyph for one state** — papercut. The original fills only `slot="enter"` of `media-cast-button`, so while
    casting media-chrome shows its own default exit glyph. The port draws the theme's glyph in both states (v10 has no
    default icon to fall back to). Not captured (no cast device).
12. **`display: block` icon buttons below 600px** — papercut. The theme sets every `.icon-button` to `display: block`
    below 600px and brings only mute and fullscreen back to flex, so a visible Cast/AirPlay glyph would sit at the top
    of its box instead of centred. Ported as is (`.ps-cast-button, .ps-airplay-button { display: block }`).
13. **Buffered bar, poster after a paused seek** — papercut, as notflix 9/10 and reelplay 4/5. The ports draw the
    theme's `rgb(255 255 255 / .4)` buffer the original never learns about in the harness, so the unplayed track is
    lighter in every port shot; and v10 drops the poster once a paused video is seeked, so the seeked extra-state shots
    show the frame where the original keeps the poster.
14. **Layer order matches without the vertical layer** — positive. media-chrome paints top chrome, centred chrome,
    the bottom gradient and the bar in that order (the gradient darkens the bauble's lower edge); keeping the same DOM
    order in one absolute `media-controls-content` reproduces it, including the bauble's `z-index: 1` below 600px.

## Parity (composite of 2026-09-24)

- **idle, hover, scrub-hover, accent-hover:** every box identical at 360/720/1080 in both editions (bauble, garlands,
  bar, buttons, track, thumb, preview; measured to 0.1px). Remaining pixels: SMIL phase, the lighter buffered track,
  the preview time (entry 8), and the accent (entry 3).
- **volume-hover:** the stick, stripes and bauble match at 720/1080 (60% and 100% checked); hidden below 600px in all
  three, as in the original.
- **playing, playing-inactive, paused-after-play:** playback timing (fill width, video frame) and SMIL phase only; the
  chrome stays up under the resting pointer in all three panes (entry 4).
- **Per-skin states** (`scratchpad/x-mas/shot.mjs`): t = 5s at 360/720/1080, hover on fullscreen (ornament swing),
  muted/low/medium glyphs, volume 60%, accent scrubbed, pointer rest vs. leave, error dialog.

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): hand-rolled shadow element again (~60 lines).
- Controls hide under a resting pointer (#7): worked around with `:hover` (entry 4).
- Poster hides after a paused seek (notflix 10, reelplay 5, vimeonova 14): seen in extra states only.
- Named icon slots become CSS; v10 never forces `fill` (the original's black icon `fill` never showed anyway).
- Volume level on the mute button only: fine, one mute button with four glyphs.
- Breakpoints become container queries: one query at 600px.
- Buttons disagree about when to hide: one `[data-hidden], [data-availability=…]` rule covers Cast and AirPlay.

## Time sinks

- Working out why the original never auto-hid in `playing-inactive` and never paused on a click (entry 4): reading
  `media-container.js` and `media-gesture-receiver.js`, then an `elementFromPoint` probe of the live original.
- The volume stick's stripe phase and bauble orientation (entries 5, 6): row dumps of the zoomed shots.
- A generator bug: the entity-only `style="&#10;"` on the pause artwork became `style={{ &#10: 'undefined' }}` and
  broke the React pane (caught by the harness's console report).

## Not verified

- Storyboard thumbnails (no storyboard in the test media); styled from media-chrome's thumbnail defaults.
- Cast and AirPlay with real devices; the Cast "connected" glyph (entry 11).
- Keyboard focus rings; touch behaviour on a real device (entry 4's touch path is by reading, not by capture).
- The live stream type (out of scope). Firefox and Safari (SMIL, `:has()` unused, `rotate`/`translate` properties).

## Proposed best-practice additions

- **Check what the original's full-size layers swallow.** A slotted chrome div at 100% × 100% (centred chrome) blocks
  media-chrome's click-to-play and stops its idle timer under a mouse; probe the live original with `elementFromPoint`
  before adding `media-gesture`, and keep the layer up with `.ps-<name>:hover` inside `@media (hover: hover)` when the
  original only hid on `mouseleave`.
- **Rotated media-chrome ranges: rotate the drawing, not the slider.** Keep the v10 slider upright
  (`orientation="vertical"`) so the pointer maps, and draw its track and thumb horizontally with `rotate: -90deg`, so
  gradients and thumb artwork match the original's orientation and phase.
- **Generate inline SVG artwork for both editions** from the legacy template, and test every `d` and every SMIL
  `values` list against it and between the editions; drop Figma ids, suffix `<mask>`/`<clipPath>` ids with `useId()`
  in React.
- **SMIL ignores `prefers-reduced-motion`.** CSS cannot stop `<animate>`; keep parity and say so in the README.
- **Blank data URIs before the selector tests.** A stylesheet carrying `url('data:image/svg+xml,<svg …>')` needs the
  test to replace them first, or the SVG markup (and its internal `url(#mask)`) reads as bare tags and external URLs.

## Summary row

| x-mas | ported (on-demand; inline SVG artwork with SMIL animations; one 600px breakpoint; live out of scope) | none | hand-rolled shadow skin element; no tap gesture and hover keeps chrome up (original's full-size centred chrome); upright vertical volume slider drawn rotated; accent drives the candy canes (original ignores it); React mask ids via `useId` | [friction/x-mas.md](friction/x-mas.md) | [screens/x-mas.png](screens/x-mas.png) |
