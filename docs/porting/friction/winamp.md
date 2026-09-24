# winamp — friction log

Port of `themes/winamp` (Media Chrome edition 0.0.13, "Winamp" by @maveio) to `skins/winamp`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup, class
names, and sprite offsets (`apps/sandbox/templates/player-style-winamp/theme.html`, `theme.css`). Date: 2026-09-24.
Composite: [`../screens/winamp.png`](../screens/winamp.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Winamp is a fixed-size bitmap skin: a 275 × 116 main window (MAIN.png) with absolutely positioned sprites, over a
275 × 148 video window whose 256 × 108 screen holds the media, centred at every width. In the original every control
sits *outside* `media-controller` and binds back with `mediacontroller="controller"`; only the screen is the
controller. No breakpoints, no `:host([attr])` variants, no `<template if>` branches, no autohide.

## Scope and preset

**Preset: video, as decided in the integration pass, and kept.** The docs page says `audio: true`, but the template
renders a video window with media and poster slots and a fullscreen button; nothing in it needs the audio preset, and
the port renders it on `<video-player>` / `VideoPlayer` unchanged. The harness entry has no `kind`.

Inventory (all in unless noted):

- **Elements:** transport row (seek back, three play buttons as play/pause/stop, seek forward, fullscreen on the eject
  sprite), `media-time-display`, `media-time-range` (empty `preview` slot, so no preview), `media-volume-range`,
  `media-captions-button` as the shuffle button, two more play buttons (the display's play-state light and the VU
  meter), static art (header, clutter bar, EQ, PL, repeat, balance, mono/stereo), the marquee, "192" / "44", the
  window frame.
- **`base64()` calls:** 23 files (22 PNGs + `VU.gif`). Inlined as data-URI tokens (entry 1). Not ported, because the
  template never references them: the five `.BMP` sources, `FULLSCREEN.png`, `fonts.css`, `winamp.ttf`,
  `winamp-numbers.ttf/.woff`.
- **`--media-*` properties:** `--media-range-*` (transparent track, thumb sizes and sprites), `--media-preview-time-*`
  (moot, the preview slot is empty), `--media-tooltip-display: none` (no tooltips, in), `--media-time-range-buffered-color:
  transparent` and `--media-range-bar-color: transparent` (no fill or buffer drawn, in). The theme reads no colour
  token; the port adds `--media-accent-color` / `--media-primary-color` on the LCD green (entry 9).
- **Out:** the controller host attributes (`defaultsubtitles`, `hotkeys`, …) as in every port.

## Entries

1. **No build-time `base64()`, and the biggest asset budget so far** (known gap) — workaround. reelplay's recipe:
   `--ps-img-<name>: url("data:image/…;base64,…")` on `.ps-winamp`, drawn as `background` on empty spans in both
   editions; the test compares each token with the legacy file byte for byte and fails on any non-data `url()`. The
   23 files are ≈54 KB, ≈73 KB of base64, 40 KB of it the animated VU meter, so `dist/skin.css` is 89.8 KB
   unminified (the original's `media-theme.js` was 92 KB with the same payload). Kept as one file: the meter is the
   theme's signature and the consumer contract is "import `skin.css`". A second GIF-sized asset would tip it towards
   a separate file. The HTML edition parses the sheet once and adopts it into every instance.
2. **Controls outside the media element: nothing to do** — positive. `mediacontroller="id"` has no v10 equivalent and
   needs none: every `media-*` element resolves the player through DOM ancestry (context), so the main window simply
   lives inside `media-container` beside the video window. Both editions.
3. **The tap gesture covers the whole container** (`media-gesture` / `createTapGesture(container)`) — workaround. In the
   original only the screen was the controller, so a click on the Winamp chrome never toggled playback. v10 registers
   the tap on the container, so a click on the frame or the main window's background would. The frame pieces and the
   main window carry `data-interactive`, which the gesture coordinator skips (`INTERACTIVE_SELECTOR` in
   `@videojs/utils/dom`, the same hook `media-controls-content` sets on itself). Upstream-worthy: a `target`/`for`
   option on `media-gesture` (`core/dom/gesture/coordinator.js`), or document `data-interactive` as public.
4. **Fullscreen takes the whole container, not the screen** (`fullscreenFeature` requests fullscreen on the registered
   container) — workaround. The original fullscreened its `media-controller`, i.e. the screen alone. The port keys on
   `.ps-fullscreen-button[data-fullscreen]` through `:has()` and hides the frame and main window while the screen fills
   the container. Checked by clicking the eject button in all three panes: identical, the poster fills the viewport.
   `media-container` reflects no `data-fullscreen` of its own (`ContainerDataAttrs` has only `controlsVisible`), hence
   the `:has()`. Upstream-worthy: reflect `data-fullscreen` on `media-container`, or let a skin name the fullscreen
   target.
5. **Positive, tiling sprite offsets** — papercut, a trap in #2714. The original writes `background: 114px 0
   var(--_c-buttons-image)` on repeating backgrounds, so each button shows sprite column `(-offset) mod 136`: one pixel
   into its neighbour, and the fullscreen button shows the *eject* glyph. #2714 converted them to negative offsets
   (`-114px`), which shows the wrong glyphs (the play button drew eject). The port keeps the original's positive
   offsets verbatim, including the odd `22px 20px` pressed row and MONOSTER's `24px 13px` / `0 25px`.
6. **Chrome snaps the handle 1px lower than its box** — papercut, one measurement pass. media-chrome hangs its 10px
   thumb `top: -4.5px` from a 1px track centred in the range (`y + 5.5`); layout puts the box at `y + 1`, but Chrome
   snaps the two offsets separately and the art paints at `y + 2`. Every box matched to 0.1px and the thumbs still
   differed by a row; a pixel-column dump showed it. The port uses `top: calc(50% - 4px)`. At fractional volumes
   (0.35) the volume handle still paints 1px left of the original's with identical layout boxes (horizontal snapping
   through the same chain); not chased further.
7. **Slider geometry** — positive, reelplay's recipe. Each range is a box at the original's position (248 × 12 and
   68 × 10, the volume box carrying VOLUME.png) with the slider inside at `margin: 0 10px`, so the pointer maps across
   the same 228px / 48px the original's `<input>` did. A click at 25% of the volume box sets 0.146 in all three panes.
   The thumbs position from `--media-slider-fill` and follow `--media-slider-pointer` while dragging.
8. **`<marquee>` becomes a CSS animation** — workaround. The original's `<marquee scrolldelay="200">` scrolls a smooth
   30px/s (sampled every frame in the live original), entering at the right edge and leaving fully at the left. The
   port animates `translateX(153px)` → `translateX(-100%)` over `(153 + text width) / 30` s = 10s for the new copy
   (146.7px in the fallback serif), `role="marquee"` kept. It stops under `prefers-reduced-motion: reduce`; Chromium's `<marquee>` in the
   original kept scrolling (measured at the same 30px/s), so this is a deliberate accessibility deviation, kept on
   review (see Round 2). The duration is tuned to the default font's width; with Monaco (macOS) the speed differs slightly.
   CSS cannot tie a duration to content width. The copy now reads "Video.js, it really whips the llama's ass!"
   instead of "Media Chrome, …" (requested); this is the only visible difference in the idle columns.
9. **Accent on the LCD green** — deliberate deviation. The original reads no colour token at all, so its
   `accent-hover` column never changes. The port puts `--media-accent-color` (then `#00e201`; round 1 also fell back to
   `--media-primary-color`, dropped in round 2) on the time, marquee, and kbps/kHz text, the only non-bitmap colour; the meter, play light, and sliders
   are artwork and stay green. Checked in `accent-hover` and a scrubbed accent capture at 5.4s.
10. **The theme's fonts were never loaded** — papercut. `fonts.css` is shipped but not referenced, so the original
    renders `'winamp-numbers', monaco` and `winamp, monaco` in the browser's default font (Times here). The port copies
    the stacks verbatim, no generic fallback, and ships no fonts (loading them would change the original's look).
11. **The poster is stretched** — papercut. The original's slotted poster gets `width/height: 100%` and the default
    `object-fit: fill`, so a 16:9 poster is squashed into the 256 × 108 screen. Ported as
    `object-fit: var(--media-object-fit, fill)`; the video keeps `contain`, as in the original.
12. **The frame's bottom row is 20px tall with 14px of art** — papercut. `.window .top, .window .bottom { height: 20px }`
    overrides nothing on the children, so 6px of page shows under the frame. Kept; the skin is 264px tall, as the
    original.
13. **Five play buttons** — positive. `media-play-button` / `PlayButton` five times (play, pause, stop, light, meter),
    each picking its art by class and `data-paused`; the meter shows `VU.gif` only while playing, the light STOP/PLAY.
    Each is a real toggle, as in the original (and each is a tab stop labelled "Play"/"Pause").
14. **Focus ring** — deliberate deviation. media-chrome's inset focus `box-shadow` painted under the button art and was
    never visible; the port adds a 1px dotted outline in the LCD colour on `:focus-visible` (outlines paint above
    content). Not in any capture.
15. **Harness: no mute button, so no `volume-hover` column** — papercut. The theme has a volume range but no mute
    button; the harness hovers `media-mute-button, .ps-mute-button`, so the column is empty for all three panes. Covered
    by `scratchpad/winamp/extra.mjs` (volume hover and click, muted, volume 0.35, pressed buttons, captions via an
    injected `data:` VTT track, seek to 5.4s/9.6s with and without accent).
16. **`@keyframes` trip the shared test's selector helper** — papercut. `selectors()` split the `to` step off as a
    bare-tag selector; the winamp test strips `@keyframes` blocks there too (`ruleSelectors()` already did), checks the
    keyframes name is `ps-winamp-` prefixed (the React stylesheet is global), and accepts `:where(.ps-winamp):has(…)`.
17. **`SkinElement` still not exported** (known) — workaround. `src/html/index.ts` is reelplay's element with the tag
    and import list changed.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original)

- **idle, hover, scrub-hover:** every box identical at 360/720/1080 in both editions (bitmaps, time box, thumbs,
  marquee box); 45–215 differing px per shot, all inside the marquee strip (new copy, animation phase). The original
  shows no hover or scrub change (empty preview slot), nor do the ports.
- **playing, playing-inactive, paused-after-play:** chrome stays up in all three (no autohide in the original);
  differences are the marquee, the VU-meter GIF frame, and playback timing (1.8s vs 1.9s frames, thumb a pixel on).
- **accent-hover:** the ports' LCD text turns `#f5c518`; the original ignores the accent (entry 9).
- **volume-hover:** empty in all panes (entry 15); extra-state shots match except the marquee and entry 6's 1px.
- **Extra states:** captions track shows the shuffle button in all three; pressed transport rows match; after a seek
  before play the ports drop the poster (known v10 gap: `started` on seek), the original keeps it.
- **HTML vs React:** identical in every shot apart from animation phase and playback timing.

## Known gaps hit again

- No build-time `base64()` — entry 1 (23 files, 73 KB of base64).
- `SkinElement` not exported — entry 17.
- Poster hides after a seek before first play (`core/ui/poster/core.js`, playback `started`) — extra states only.
- Named icon slots become CSS (`slot="play"`/`"pause"` → `data-paused` rules on the light and meter).
- Buttons disagree about when to hide: captions hides on `unavailable` (with `hidden`), fullscreen on non-`available`;
  the generic `[data-hidden]`/`[data-availability]` rule covers both.
- media-chrome ships default button styles, v10 none — every box spelled out.

## Time sinks

- The 1px thumb row (entry 6): boxes matched, pixels did not; a column dump found it.
- Verifying the marquee's real speed and timing function in the live original (its animation lives in a closed UA
  shadow root, invisible to `document.getAnimations()`); sampled the text range's position per frame instead.

## Positives

- The whole theme is static bitmaps at fixed coordinates; with reelplay's asset recipe and test the first render
  matched every box of the original at all three widths in both editions.
- Controls outside the "controller" needed no binding at all (entry 2).
- Captions button, fullscreen button, and five play buttons mapped one-to-one; no script beyond the shared element.

## Not verified

- The error dialog over the 256 × 108 screen (styled from reelplay's spelled-out media-chrome dialog, scaled to 12px).
- Real fullscreen on a device (headless click only), keyboard focus outline, touch.
- Monaco rendering (macOS), where both the original and the ports switch fonts and the marquee speed shifts slightly.

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/winamp.png`](../screens/winamp.png).

### Theming tokens

The original reads no colour token at all: every colour is bitmap art except the LCD text, which is hard-coded
`#00e201`. The theme's one non-bitmap brand colour is that classic green, so it becomes the brand property:
`--ps-accent: var(--media-accent-color, #00e201)` on `.ps-winamp`. It was renamed from round 1's `--ps-lcd` to match
the catalogue's usual name.

| Token | Colours | Default |
| --- | --- | --- |
| `--media-accent-color` (`--ps-accent`, the brand colour) | LCD text (time, marquee, kbps/kHz) and the keyboard focus outline | `#00e201` |

- **`--media-primary-color` fallback dropped.** Round 1 read `var(--media-accent-color, var(--media-primary-color,
  #00e201))`. The original ignores the primary colour, so a page that sets it (for another skin, say) must not turn the
  LCD. `--media-primary-color` and `--media-secondary-color` now change nothing, as in the original.
- The gold slider handles, VU meter, play-state light, and the green slider grooves are bitmaps and do not recolour.
  A `mask` over the accent would change their pixels, and the brief asks only for the brand surface.
- Checked on a scratch page (built `dist/html.js`, paused at 5s):
  - `--media-accent-color: #f5c518` turns the time, marquee and readouts yellow.
  - `--media-primary-color: red; --media-secondary-color: blue` leaves the skin identical to the default.
- `tests/skin.test.ts` asserts the root declaration; the README's "Theming" table lists it.

### Template conditionals

The original has no `<template if>`, so there are no scope cuts from conditionals. The controller host attributes
stay out, as in every port.

### Reduced motion

**Deliberate deviation, kept on review.** Round 1 stopped the marquee under `prefers-reduced-motion: reduce`. Measuring
Chromium 1194 (headless, Playwright `reducedMotion`), sampling the text's left edge every 500ms:

- `no-preference`: 160, 145, 130, 115, …
- `reduce`: 8 (the first frame, before scrolling starts), 146, 131, 116, …

The original's `<marquee scrolldelay="200">` therefore scrolls at the same 30px/s either way. The port keeps the round-1
stop anyway: matching a browser quirk that ignores the user's preference is not what "match the original" is for, and
the text stays readable at its resting position. The animated `VU.gif` meter plays in both, since an animated GIF
ignores the media query. Firefox and Safari were not measured.

### Preset

Stays on the video preset (`<video-player>` / `VideoPlayer`), as decided in round 1.

### New v10 gaps

None.
