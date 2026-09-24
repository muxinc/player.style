# reelplay — friction log

Port of `themes/reelplay` (Media Chrome edition 0.1.2, by @davekiss) to `skins/reelplay`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury
(`apps/sandbox/templates/player-style-reelplay/theme.html` and `theme.css`) for the first draft of the markup, the
class names, and the inlined artwork. Date: 2026-09-24. Composite: [`../screens/reelplay.png`](../screens/reelplay.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Reelplay is a retro desktop player drawn almost entirely in pixel art: a title strip, a grey transport bar with three
play buttons standing in for play, pause, and stop, 30-second seek arrows, dotted embossed sliders with a bitmap handle,
and an LCD status bar (a play-state light, a fixed "32.1 Kbps", the time, and two credits). Everything it draws is a
PNG inlined by the Media Chrome build's ejs `base64()` helper, which is the main thing this port had to replace.

## Scope

Inventory of the original (`template.html`, `assets/*`):

- **Elements:** title strip; `media-control-bar` with three `media-play-button`s (`.play`, `.pause`, `.stop`), seek
  backward/forward, `media-time-range` (preview thumbnail and time), spacer, mute, `media-volume-range`; status bar with
  a fourth play button (`.status`), `media-time-display showduration`, and three text panels; error dialog. All in.
- **`base64()` calls:** 13 PNGs. In, as data URIs (entry 1). `speaker-inactive.png` is shipped but never referenced
  (the template draws `speaker-inactive-2.png`); `PixelifySans-Regular.ttf` and `fonts.css` are shipped but never
  loaded. Neither is ported.
- **`:host([attr])` variants, `breakpoint*` rules, `<template if>` branches, `{{partials}}`:** none. The theme declares
  `container: media-theme-instaplay / inline-size` (a copy-paste leftover) and never queries it.
- **`--media-*` properties:** `--media-primary-color` (host text colour, in), `--media-secondary-color` and
  `--media-accent-color` (read into `--_secondary-color`/`--_accent-color`, never used; the accent is now wired to the
  fills, entry 7), `--media-icon-color`, `--media-control-background` `#ccc`, `--media-control-hover-background:
  transparent` (no hover surfaces, in), `--media-control-height: 1.2em`, `--media-tooltip-display: none` (no tooltips,
  in), the `--media-range-*` track/thumb/bar values, `--media-button-padding`, the time display's font values,
  `--media-preview-box-margin`. All reproduced as literal values.
- **Controller attributes** (`defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`, `nohotkeys`): out, as
  in every port; the skin ships media-chrome's default hotkey set and a mouse tap gesture.

## Entries

1. **No build-time `base64()`** (v10 / catalogue, known gap) — workaround. The 13 PNGs (3.4 KB) are inlined at author
   time as `--ps-img-*: url("data:image/png;base64,…")` tokens on `.ps-reelplay` (4.7 KB of base64) and drawn as
   `background-image` on empty `.ps-icon` spans, so `dist/skin.css` (22.3 KB unminified) stays the single file consumers
   import; no `?url`/`?inline` asset imports, nothing under `src/assets/`. The tokens came from #2714 and were checked
   byte for byte against `themes/reelplay/assets`; the skin test now repeats that check whenever the legacy theme is in
   the repo, and fails on any `url()` that is not a data URI. Had the theme used its 51 KB Pixelify font, the same
   recipe would have cost ≈ 68 KB of base64 in `skin.css`; a font of that size would justify a separate file. Not
   upstream-worthy beyond the known gap.
2. **Handle nudges keyed on `mediacurrenttime`/`mediavolume`** (v10: no reflected numeric state, known gap) —
   workaround, not dropped. The original shifts the 13px handle ±6px so it stays inside the groove, with prefix
   selectors such as `media-time-range[mediacurrenttime^='1.']` and `media-volume-range[mediavolume^='0.3']`. #2714
   dropped them. v10's `media-slider-thumb` (and `TimeSlider.Thumb`/`VolumeSlider.Thumb`) carries `aria-valuenow`:
   seconds for the scrubber (the same unrounded float media-chrome reflects), 0–100 for the volume. The same prefix
   selectors therefore work on the thumb (`[aria-valuenow^="1."]`), and for volume the tenths become leading digits
   (`^="3"`, with one-digit values and `100` overridden after). Verified in both editions at t = 0, 2.5, 5.4, 9.6 and
   volume 0.05, 0.35, 1, muted. Upstream-worthy as a request, not a bug: styling on an ARIA attribute is fragile
   (during a drag it reports the pointer value); a `data-value` or a `--media-slider-value` in the slider's own units
   (`core/ui/slider/core.js`, `time-slider/core.js`, `volume-slider/core.js`) would be the supported hook.
3. **Slider hit area vs media-chrome's gaps** — papercut. A media-chrome range is `width: 100%` (volume `100px`) with
   10px gap divs inside, and the two shrink against each other by their full width. v10's slider maps the pointer
   against its root's rect (`dom/ui/slider/slider.js`), so the gaps cannot be padding on the slider without skewing
   seeks by 10px. The port wraps each slider in a `.ps-range-box` that takes the flex sizing (`min-width: 60px`, as the
   original's container min-width plus gaps) and puts the gaps on the slider as margins. Padding on the box instead
   changed the shrink split (flex shrinks by inner size): 484.4/74.6px instead of the original's 489.1/69.9px at 720.
   With margins every box matches to 0.1px at 360/720/1080.
4. **Buffered bar missing from the original's captures** (harness, not v10) — papercut, and most of the composite's
   remaining differing pixels. media-chrome draws the buffered range in `rgb(255 255 255 / .4)` over the groove, but in
   the harness its `mediabuffered` attribute stays empty (`video.buffered` is `[0, 10]`: the small local WebM is fully
   buffered before the controller listens for `progress`). The ports draw the buffer as media-chrome does with real
   streams, so their unplayed groove is lighter in every shot. Kept deliberately; with the buffer hidden, the 720 idle
   shot differs from the original only in text antialiasing (780 px, entry 6).
5. **Poster hides on a seek before play** (v10) — papercut. v10's `started` is `!paused || currentTime > 0`
   (`dom/store/features/playback.js`), so seeking a paused, never-played video removes `data-visible` from the poster;
   media-chrome keeps the poster until `mediahasplayed`. Seen only in the per-skin script (`near-end`, `at-2s`,
   `accent-scrubbed`). Not worked around. Worth filing: a `played` flag, or poster visibility on first play.
6. **Greyscale text antialiasing over the picture** (Chromium compositing) — papercut, the port's main time sink. The
   ports' title and status text render with greyscale antialiasing where the original's is subpixel (≈ 500 px per
   720 shot; glyph shapes and positions identical). CDP's layer tree shows the port's chrome squashed with the poster
   into one `Overlap` layer over the video, while media-chrome's layers split differently. Restyling the poster after
   load flips the port to subpixel text, but nothing tried at authoring time did (isolation, overflow, containment, the
   opacity transition, `will-change`, z-index, poster `display`). Invisible at 1×; left alone.
7. **Accent wired to an unused token** — deliberate deviation. The original reads `--media-accent-color` into
   `--_accent-color` and never uses it, so its `accent-hover` column never changes. Per the catalogue rule the port
   makes `--media-accent-color` drive the theme's one strong colour, the teal `#008484` of both slider fills (fallback
   kept). Checked in `accent-hover` (volume fill) and a scrubbed accent capture at 5.4 s (both fills `#f5c518`, the
   original teal).
8. **The scrub preview never shows** (original's layout) — papercut. `--media-preview-box-margin: 0 0 20px` puts the
   preview 20px above a scrubber that sits in the top bar, i.e. above the player, where `overflow: hidden` clips it.
   The port keeps the same placement (`bottom: 100%` + 20px), so it is clipped the same way; `scrub-hover` equals
   `hover` in all three panes.
9. **`line-height: 0` is part of the look** — papercut. media-container sets `line-height: 0`; the status bar inherits
   it, so its labels have zero-height lines and, at 360px, wrapped words overprint ("Theme by @davekiss" over two
   lines). The port sets `line-height: 0` on the chrome and reproduces the overprint exactly; the time keeps
   media-chrome's text-display line height (1.2), which is what gives the panels their 25.6px height.
10. **Font stacks kept verbatim** — papercut. The status bar is `font-family: monaco` with no generic fallback, so
    outside macOS it renders in the browser's default serif; the title strip is `monaco, sans-serif`. #2714 added
    `monospace`, which changes the look everywhere Monaco is missing. The port keeps the original stacks.
11. **Seek arrows skip 30 seconds** — papercut. media-chrome's seek buttons default to 30s (the controller's hotkeys to
    10s); v10's `media-seek-button` needs explicit `seconds`, and #2714 used ±10. Ported as ±30.
12. **Time display is three elements** (v10) — papercut. `media-time-group` › `media-time` + `media-time-separator` +
    `media-time` shapes "0:00 / 0:10" in three runs, 0.1px wider than media-chrome's single text node, so the last
    glyphs antialias differently. Not worth filing.
13. **Three play buttons as play, pause, stop** — positive. Four `PlayButton`s (three transport, one status light) all
    reflect `data-paused`; one rule pair picks each button's paused or playing glyph, and the per-button artwork is a
    background swap. React renders them through one small helper.
14. **Autohide** — positive. Both bars live in one `media-controls-content` (`space-between`, transparent between),
    fading out over 1s and in over .25s like media-chrome's slotted chrome, and hiding only while playing.
15. **`SkinElement` not exported** (v10, known) — workaround. `src/html/index.ts` is instaplay's element with the tag
    and the import list changed.
16. **Parity test without SVG** — papercut. The shared test compares SVG `d` paths; this skin has none. The copy
    compares the `ps-icon-*` glyph classes of both editions, checks every artwork token is inlined and used, the
    byte-for-byte match with the legacy PNGs, the visible text of both editions, and that the HTML entry registers
    exactly the elements the template uses. The tooltip test is dropped (the theme disables tooltips).

## Known gaps hit again

- Binary assets need inlining at author time (no build-time `base64()`) — entry 1.
- No reflected numeric state (`mediacurrenttime`, `mediavolume`) — entry 2, bridged with `aria-valuenow`.
- `SkinElement` not exported — entry 15.
- media-chrome ships default icons/button styles, v10 none — all artwork and button boxes spelled out.
- Named icon slots become CSS (`slot="play"`/`"pause"` → `data-paused` rules).
- Volume level on the mute button only — fine here (one mute button, two glyphs).

## Parity (composite of 2026-09-24, pixel diff of each shot against the original)

- **idle, hover, volume-hover, scrub-hover:** layout identical at 360/720/1080 in both editions (every box within
  0.1px of the live original's). Differing pixels are the lighter buffered groove (entry 4) and text antialiasing
  (entry 6); with the buffer hidden, 780 px remain at 720. The original shows no hover change, and neither do the ports.
- **playing, playing-inactive, paused-after-play:** differences only from playback timing (5.4 s vs 5.5 s frames, a few
  pixels of fill and handle), the buffer, and antialiasing; the handle nudge (+6px under 3 s, −6px after) and the
  play-state glyphs match; the chrome fades out and back in as in the original.
- **accent-hover:** the ports' volume fill turns `#f5c518`; the original does not change (entry 7). Scrubbed accent
  capture: both fills follow the accent.
- **Per-skin states** (`scratchpad/reelplay/extra.mjs`, 360/720/1080): muted, volume 0.05/0.35, t = 2.5 s, 9.6 s — the
  bars match; the poster differs after a seek before play (entry 5).

## Time sinks

- Text antialiasing (entry 6): a dozen layer experiments with a style-injection script and a CDP layer dump, no fix.
- Reproducing media-chrome's flex shrink for the two sliders once the gaps moved out of the slider (entry 3).

## Not verified

- Storyboard thumbnails and the preview time (clipped above the player by design, entry 8).
- The error dialog: media-chrome's built-in dialog, styled from instaplay's port without a visual check.
- Keyboard focus rings (inset ring on buttons, outline on the slider thumbs) and touch behaviour.
- Rendering on macOS, where Monaco exists and both the original and the ports switch the status bar to it.

## Proposed best-practice additions

- **Inline binary assets as data-URI tokens.** For each file, emit
  `--ps-img-<name>: url("data:image/png;base64,$(base64 -w0 <file>)");` into the root rule of `skin.css`, draw them
  with `background-image: var(--ps-img-<name>)` on empty `.ps-icon` spans in both editions, and keep the file a single
  stylesheet. Add a test that decodes nothing but compares each token with `readFileSync(<legacy asset>).toString('base64')`
  when `themes/<name>/assets` exists, and that fails on any non-data `url()`. Inventory which shipped assets the
  template actually references; themes ship dead files. Past ~20 KB of assets (fonts), weigh a separate file.
- **Reflected numbers live on the thumb's `aria-valuenow`.** Where a theme keys styles on `mediacurrenttime` or
  `mediavolume`, add a `media-slider-thumb` and use the same prefix selectors on `aria-valuenow` (seconds; volume in
  0–100, so `^='0.3'` becomes `^="3"` plus overrides for one-digit values and `100`).
- **Keep slider gaps off the slider.** v10 maps the pointer against the slider root's box; put media-chrome's range
  padding on the slider as margins inside a sizing wrapper, not as padding on the wrapper (flex shrinks by inner size).
- **Check the buffered bar before chasing groove colours.** In the harness media-chrome often never learns the local
  WebM's buffered range; a lighter unplayed track in the ports is expected.
- **Copy font stacks verbatim**, including a missing generic fallback; the fallback font is part of the original's
  look everywhere the named font is absent.

## Summary row

| reelplay | ported (on-demand; 16:9; artwork inlined as data URIs) | none | inlined PNG artwork (no `base64()`); handle nudges via thumb `aria-valuenow`; slider gaps as margins in a sizing wrapper; accent drives the fills (original ignores it); hand-rolled shadow skin element | [friction/reelplay.md](friction/reelplay.md) | [screens/reelplay.png](screens/reelplay.png) |
