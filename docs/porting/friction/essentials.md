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
