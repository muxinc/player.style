# halloween — friction log

Port of `themes/halloween` (Media Chrome edition 0.1.2, "Halloween" by @muxinc) to `skins/halloween`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup, the class
names, and the single-slider idea (`apps/sandbox/templates/player-style-halloween/theme.html`, `theme.css`).
Date: 2026-09-24. Composite: [`../screens/halloween.png`](../screens/halloween.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Halloween is a seasonal theme built from artwork and animation, not from controls: a jack-o'-lantern play button in the
middle (its carved face lights up while playing, and it grows threefold while pressed), a cobweb time range with a
spider thumb that "walks" while the video plays, and a candle volume range whose flame flickers and glows brighter per
volume level. There is no mute, time display, or fullscreen button. The port measures box-for-box identical to the live
original at 360/720/1080 in both editions (pumpkin button and glyph, bar, time track, spider, candle track and wax).

## Scope

Inventory of `template.html`:

- **Elements:** centred `media-play-button` with the inline pumpkin SVG; a control bar with two stacked
  `media-time-range`s (`.web`: track, buffered, progress, preview thumbnail and time; `.spider`: thumb only, click-through,
  animated) and two stacked, rotated `media-volume-range`s (`.flame`: thumb only, animated; `.candle`: track and wax);
  `media-error-dialog`. All in.
- **`base64()` calls, `{{partials}}`, `<template if>` branches, `:host([attr])` variants:** none. The artwork is four
  plain SVG data URIs in the stylesheet (spider thumb, and the web drawn three times at 25%, 35% and 90% alpha for
  track, buffered and progress).
- **Breakpoints:** one, `@container (inline-size >= 384px)` (the pumpkin's 14px → 17px, the preview gap 20px → 1em). In.
  The same block's `media-controller { font-size: 17px }` never matched (the container cannot match its own query), so
  the bar stays 16px; ported as such.
- **Animations:** `spider-walk` (0.5s, while playing), `candle-anim` (2s, always except at level `off`), transitions on
  the thumbs, progress, face fill and the `:active` scale. In. The original has no `prefers-reduced-motion` guard; the
  port keeps parity and says so in the README.
- **`--media-*` properties:** `--media-primary-color` (face, `#000`), `--media-secondary-color` (only fed a preview
  background the theme then overrides to transparent: dead), `--media-accent-color` (read into `--_accent-color`, never
  used), `--media-font-weight: bold` (preview time), `--media-tooltip-display: none` (no tooltips), transparent control
  backgrounds, range track height/padding. All reproduced as literal values or tokens.
- **Controller attributes** (`defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`, `nohotkeys`): out, as
  in every port; the skin ships media-chrome's default hotkey set and a mouse tap gesture.

## Entries

1. **Stacked duplicate ranges collapse into one slider** — positive. The original duplicates each range because a
   `::part(thumb)` cannot carry an animation independent of its host; v10's thumb is a real element, so the port has
   one `media-time-slider` and one `media-volume-slider`. #2714 had the idea; the port adds the two wrappers that make
   the animations faithful (entries 2, 3).
2. **The spider walks by rotating the whole range, not the thumb** — workaround. `spider-walk` rotates the entire
   344px `.spider` range by ±0.3° about its right-hand middle (`transform-origin: 100% 50%`), so the far-left spider
   bobs ~2px; the 100% keyframe is implicit (back to `none`). #2714 animated the thumb itself, which spins the spider in
   place. The port wraps the thumb in a `.ps-spider-box` that spans the slider and pivots at `calc(100% + 30px) 50%`
   (the range padding), with the original keyframes. v10 has no `data-paused` on the container, so the rule is
   `.ps-halloween:has(.ps-play-button:not([data-paused]))`.
3. **The flame flickers by scaling the whole range** — workaround. `candle-anim` scales the 80 × 24px flame range about
   its centre, which also pushes the thumb outward; a `.ps-flame-box` spanning the slider (same centre) carries the
   animation, and the thumb sits inside it. The candle range was stacked *after* the flame range, so the wax and empty
   track paint over the flame's base: the port needs `z-index: 1` on the track (first draft had the flame on top; seen
   in a 2× crop).
4. **Volume level lives on the mute button only** (known gap) — workaround. The glow (`medium`, `high`) and the black
   "snuffed" flame (`off`) key on `mediavolumelevel`, and the theme has no mute button. The port renders a
   `display: none` `media-mute-button` / `MuteButton` (`.ps-volume-state`, `tabindex="-1"`, `aria-hidden`) purely as a
   state carrier and reads it with `:has()`, as #2714 did. Because it is `display: none`, the harness's `volume-hover`
   target finds no box and the column stays empty in all three panes, as for the original. Upstream-worthy:
   `data-volume-level` (and `data-muted`) on `media-volume-slider` / `VolumeSlider.Root`
   (`core/ui/volume-slider/core.js`, which already computes `muted`).
5. **Rotated volume slider** — positive. The original rotates the range −90° and scales it to 60%. The port keeps that
   exact transform on `.ps-volume-box` and marks the slider `orientation="vertical"`: v10 maps the pointer against the
   root's `getBoundingClientRect()` (`dom/ui/slider/slider.js`), which for the rotated root is the upright 14.4 × 28.8px
   box, bottom to top. A click 25% up the candle set `volume` to 0.25 in both editions. The slider root is the 48px
   track (media-chrome's 1em range padding moved to margins), so value mapping matches media-chrome's input.
6. **Preview positioned across the padded range** — workaround, as vimeonova entry 3. media-chrome takes the pointer
   ratio over the track (30px inset) but positions the preview box at that ratio across its whole 344/704/1064px range
   (`media-time-range.js` `#getBoxPosition`), so the time sits up to 30px left of the pointer. A `.ps-rail`
   (`inset: 0 -30px`) holding the `media-slider-preview` reproduces it; with a matched pointer the preview lands on the
   original's pixels at 720 in both editions.
7. **Harness hover target differs by element** — papercut, harness-side. `capture.mjs` hovers the first
   `media-time-range, media-time-slider, .ps-range` at 40%: the original's range includes its 30px padding, the port's
   slider does not, so the pointers differed by 6px and the preview times by a second. The port puts `ps-range` on the
   padded wrapper (and names the slider `ps-time-slider`), so all three panes are hovered at the same x. The preview
   *time* can still read a second apart (0:04 vs 0:03 at 360): media-chrome skips a preview update while
   `Math.round(time)` is unchanged (`media-time-range.js` `#handlePointerMove`), so after the harness's four-step move
   it shows an earlier step's time (≈4.4s), where v10 shows the pointer's (3.79s). Not the port's to fix.
8. **Accent drives the spun web** — deliberate choice. The original declares `--_accent-color: var(--media-accent-color,
   #fff)` and never uses it; its default is exactly the white of the played web. The port paints the progress web with
   `background: var(--media-accent-color, #fff)` through the original SVG as a `mask` (the SVG keeps its 0.9 alpha, so
   the default renders identically and overlaps keep media-chrome's compounding). The carved face stays on
   `--media-primary-color` (`#000`), as in the original. `accent-hover` is idle (0% played), so it shows no change;
   a scrubbed accent capture at 5s shows the web in `#f5c518` in both editions and white in the original.
9. **Artwork inlined byte for byte** — positive. No `base64()` here: the four SVG data URIs move into `--ps-img-*`
   tokens on the root unchanged (the web SVGs have `height="35"` and a viewBox but no width, so their tiles are 462.5px
   wide, which only reproduces if the markup is untouched). The skin test compares them with the legacy template's
   `url()`s and the pumpkin's paths with the legacy markup's whenever `themes/halloween` exists.
10. **media-chrome thumb defaults leak into the look** — papercut. The spider's box keeps media-chrome's default
    `border-radius: 10px` (it clips the leg tips) and both thumbs are centred with the `translate: -50%` property, under
    the theme's own `transform`. The port copies both; the spider's `transform: translate(-8px, -13px)` then matches.
11. **Buffered web in the ports only** (harness, not v10) — papercut, as minimal/notflix/reelplay. The original's
    `mediabuffered` stays empty for the local WebM, so its web is drawn at 25% alpha; the ports add the 35% buffered
    web on top, a slightly darker line in every idle/hover/scrub cell.
12. **Poster after a seek, and after returning to 0** (v10) — papercut. v10's poster follows `started`
    (`!paused || currentTime > 0`): it hides on a paused seek (known) and *reappears* when a played video is paused and
    rewound to 0, where media-chrome keeps it hidden after `mediahasplayed`. Seen only in the extra `pressed` state.
13. **Controls stay up under a hovered control** (known gap #7) — workaround, as vimeonova entry 10. The harness pointer
    rests on the pumpkin in `playing-inactive`, and media-chrome (no `autohideovercontrols`) keeps the chrome up; the
    hidden-layer rules carry `:not(:has(.ps-play-button:hover, .ps-bar:hover))`. With the pointer on the picture, all
    three panes hide the pumpkin and bar (extra state `inactive-off-controls`).
14. **`SkinElement` not exported** (known) — workaround. `src/html/index.ts` is reelplay's element with the tag and
    import list changed.

## Parity (composite of 2026-09-24)

- **idle, hover, accent-hover:** identical layout at 360/720/1080 in both editions (every box equal to the original's
  to 0.1px); differences are the buffered web (entry 11) and the flame's animation phase.
- **scrub-hover:** preview time box, font, shadow and gap match; the harness pointer now lands at the same x in all
  panes (entry 7).
- **playing, playing-inactive, paused-after-play:** lit face, pause glyph, spun web, spider position and walk match;
  frame timing differs by a tenth of a second. Chrome stays up under the resting pointer in all three (entry 13).
- **volume-hover:** empty in all three panes (no mute button in the theme; entry 4).
- **Extra states** (`scratchpad/halloween/extra.mjs`, `quick.mjs`): volume medium/low/muted (glow rings, snuffed
  flame, wax height), seek to 5s with and without the accent, pressed pumpkin (3× in both), autohide off the controls,
  volume click mapping — all match except entries 8 (by design) and 12.

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): shadow skin element copied from reelplay.
- Volume level on the mute button only (#2714): hidden mute button as a state carrier (entry 4).
- Controls hide under a resting pointer (friction-log #7): `:has(:hover)` guard (entry 13).
- Slider preview positions from the slider root (friction-log #11): padded rail (entry 6).
- v10 never forces `fill` (#2714): the pumpkin's `fill="none"` root needs `fill: var(--ps-primary)` for its face.
- Named icon slots become CSS (#2714): play/pause glyphs inside one SVG toggle on `data-paused`.
- Poster hides on a paused seek (notflix #10, reelplay #5): plus the rewind case (entry 12).
- Breakpoints become container queries (#2714); the theme's container-targeting rule never matched in the original.

## Time sinks

- Reading the animations closely enough to see that both rotate/scale the *whole* duplicated range, not the thumb
  (entries 2, 3), and that the 100% keyframe is implicit.
- Working out the preview offset from media-chrome's `#getBoxPosition` after a first capture showed the time 7px off.
- One full composite takes ~4.5 minutes; iteration ran on per-state scripts against the dev server instead.

## Positives

- The live original's shadow-root box dump settled every size on the first pass; nothing was eyeballed.
- Real thumb elements made the "duplicate the range to animate the thumb" trick unnecessary.
- The rotated-and-scaled volume slider works unchanged with `orientation="vertical"`.

## Not verified

- Storyboard thumbnails (no storyboard in the test media); the 120 × 80 box is reproduced empty.
- The error dialog against media-chrome's default dialog (copied from minimal's port).
- Keyboard focus rings on the sliders (ring on the range wrapper and the volume box), touch, and Firefox/Safari
  (`:has()`, `mask`, `translate`).
- Volume unavailable (iOS): the candle hides on `data-hidden` by CSS only.

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/halloween.png`](../screens/halloween.png).

### Tokens

| Token | Surface | Default | Original |
| --- | --- | --- | --- |
| `--media-accent-color` | Pumpkin body (`--ps-brand`, `.ps-pumpkin-body`) | `#ff8000` | Never consulted; the artwork's `fill="#FF8000"` was fixed |
| `--media-accent-color` | Spun (played) web (`--ps-accent`, mask over the original SVG) | `#fff` | Read into `--_accent-color` (`#fff`), never used |
| `--media-primary-color` | Carved face while paused; preview time (under `--media-text-color`) | `#000`; `rgb(238 238 238)` | Same |
| `--media-text-color` | Preview time | `rgb(238 238 238)` | Same (media-chrome's text displays) |
| `--media-secondary-color` | Nothing | none | Fed `--media-preview-time-background`, which the theme overrode to transparent on the next line |
| `--media-font-family`, `--media-border-radius`, `--media-object-fit`, `--media-object-position` | Preview time; corners; media and poster fit | media-chrome defaults | Same |

The brand colour is the pumpkin's orange, declared once on the root as `--ps-brand: var(--media-accent-color,
#ff8000)`. The pumpkin path keeps its `fill="#FF8000"` attribute (the look without the stylesheet) and a class rule
outranks it. The round-1 wiring of the accent to the spun web stays: the original's own `#fff` accent default is the
web's white, so an unset accent renders exactly as before. Set, one colour now recolours both the pumpkin and the web.
The stem (`#0bb037`), lit face (`#ffe194`), wax, flame and glow (`#ffb319`, `#f88f01`) stay fixed artwork. The composite's
`accent-hover` column shows the pumpkin in `#f5c518` in both ports and orange in the original, which is the intended
difference. A scratch page (`scratchpad/accent/`, `--media-accent-color: #8a2be2`, seeked to 4s) showed a purple
pumpkin and purple spun web, with everything else unchanged.

### Template conditionals and reduced motion

- No `<template if>` branches in the original, so no scope cuts.
- Reduced motion: the original has no `prefers-reduced-motion` guard on `spider-walk`, `candle-anim` or its
  transitions; the port has none either (parity, as the README says).

### Scope cuts

None new. The controller attributes (`defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`,
`nohotkeys`) stay out, as in round 1.

### New v10 gaps

None. Recolouring inline SVG artwork needs only a class on the path, since v10 leaves `fill` alone (round-1 note).

