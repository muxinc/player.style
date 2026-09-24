# demuxed-2022 — friction log

Port of `themes/demuxed-2022` (Media Chrome edition 0.1.2, "Demuxed 2022" by @maveio) to `skins/demuxed-2022`. Based
on [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup and CSS
(`apps/sandbox/templates/player-style-demuxed-2022/theme.html`, `theme.css`). Date: 2026-09-24. Composite:
[`../screens/demuxed-2022.png`](../screens/demuxed-2022.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Demuxed 2022 is a small theme with one strong look: white 32px disc buttons with black glyphs on a translucent pill bar
inset 30px, a 96px round play button in the middle, a 1×170 PNG scrim along the bottom, 6px tracks with 14px accent
thumbs, and a volume pill that rises from behind the mute button. One breakpoint (`sm:600`): below it the pill goes
flat and full-width with 48px buttons (glyphs scaled 1.4×) and a 72px play button. Both editions measure box for box
identical to the live original at 360/720/1080 (bar, every button and glyph box, volume pill, track, thumb, time
display, preview time).

## Scope

Inventory of `template.html`:

- **Elements:** top chrome (Cast, AirPlay), centred play button, scrim, control bar (play, mute + volume range, time
  display with duration, time range with preview thumbnail and time, captions, PiP, fullscreen), error dialog. All in.
- **`:host([attr])` variants:** `mediastreamtype="live"` (time range and display at `opacity: 0`). Out: live is its
  own preset in v10, and the stream type is not reflected on any v10 element (entry 12).
- **Breakpoints:** `xs:360 sm:600 md:760 lg:960 xl:1100` declared, only `breakpointsm` used. In, as
  `@container ps-demuxed-2022 (inline-size < 600px)`.
- **`<template if>` branches, `{{partials}}`, `base64()` calls:** none. The scrim is an inline data URI in the
  template itself; copied verbatim (entry 9).
- **`--media-*` properties:** `--media-primary-color` (black glyphs), `--media-tertiary-color` = accent or `#7596CC`
  (thumbs, hover rings), `--media-secondary-color` (button faces, white), `--media-text-color`, the `--media-range-*`
  track/thumb values, `--media-control-hover-background: transparent`, `--media-tooltip-display: none` (no tooltips,
  so none ported). All in, as `--ps-*` tokens with the public names as overrides.
- **Controller attributes** (`defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`, `nohotkeys`): out,
  as in every port; media-chrome's default hotkeys and a mouse tap gesture ship instead. No loading indicator: the
  theme has none.

## Entries

1. **Measure first, again** — positive. A shadow-root box dump of the live original at 360 and 720 (vimeonova's
   `measure.mjs`, retargeted) gave every value; the first draft matched every box to 0.1px in both editions. #2714's
   draft had the geometry mostly right but hid the mute button below 600px (the original keeps it, 48px), put the
   theme's `:first-child`/`:last-child` margins on direct bar children only (entry 2), inset the volume slider with
   margins instead of mapping it to the 80px track, and had no poster slot or hover-keeps-chrome rule.
2. **The theme's `media-control-bar :first-child` is a descendant selector** — papercut. It also matches the mute
   button (first child of the volume wrapper, so `margin: 0 5px 0 0` instead of `0 5px`) and the rotated volume
   wrapper (last child, so a 5px `margin-left` that is part of the pill's offset). Ported as explicit margins on
   `.ps-bar-play`, `.ps-mute-button`, `.ps-fullscreen-button` and in the pill's `bottom`/`left`.
3. **Controls hide under a resting pointer** — workaround, known gap 7. The harness pointer rests on the centred play
   button, so the original keeps its chrome up in `playing-inactive` at every width (media-chrome only schedules
   inactivity for pointer moves over the controller or media). The port keeps `.ps-layer` opaque with
   `:not(:has(.ps-bar:hover, .ps-big-play:hover, .ps-top .ps-button:hover))` on both the opacity and the
   `pointer-events: none` rules, as vimeonova does. An extra `away` capture (pointer on the video) confirms all three
   panes still hide everything, scrim included.
4. **Paint order from the flat tree** — papercut. media-chrome paints top chrome, then the centred layer, then the
   default slot (scrim, then bar), so the scrim darkens the Cast/AirPlay buttons and the play button's bottom 10px
   but never the bar; below 600px the play button gets `z-index: 1` and rises above it. The port keeps one controls
   layer and reproduces the order with DOM order (`.ps-top`, `.ps-center`, `.ps-gradient`, `.ps-bar`) plus the same
   `z-index`. The bar stays `position: relative` below 600px too: the original's range and buttons paint above the
   scrim there (sampled: the fill is pure white), which a static bar would not give.
5. **Rotated volume pill with an invisible hover area** — workaround. The original rotates a 122 × 34 wrapper with a
   16px transparent border by -90°: a 100px pill ending at the bar's top edge, 17px of invisible wrapper above it and a
   21px bridge below it that reaches over the mute button. It is only `opacity: 0` while closed, so hovering that
   invisible area opens it. The port uses `media-volume-slider orientation="vertical"` (`VolumeSlider.Root
   orientation`) on the 80px track inside a 34 × 138 `.ps-volume-range` box, with the pill drawn by `::before`; the
   same invisible area opens it. Pixel-equal at 720 (vol 1, 0.3, muted); media-chrome's rotated `<input>` was 39px
   wide, the port's hit area 34px.
6. **The range wrapper is the harness target** — papercut, 20 minutes. media-chrome's range box is 373px at 720 with
   10px gaps inside; the pointer maps onto the 353px track and the preview centres on the pointer. The port puts
   `.ps-range` on a wrapper with the range's box and the `media-time-slider` (`.ps-time-slider`) on the track, so the
   harness's `scrub-hover` (40% across the first `.ps-range`) lands on the same pixel and reads `0:03` like the
   original; with the slider itself as `.ps-range` and 10px margins it would land 2px right and read `0:04`. Below
   600px the wrapper also takes the bar's 48px content height (`align-self: stretch`), which is what puts the preview
   5px above a 48px box there, as in the original.
7. **Captions button below 600px** — papercut. The theme positions it `absolute; top: 22px; left: 16px` below 600px,
   but its own `.small-button { display: none }` at that width already hides it, so it never shows. Ported the effect
   (hidden). Verified with an injected `<track>`: the button shows at 720 in all three panes, at 360 in none.
8. **Buffered bar and text antialiasing** — papercut, known (minimal 6, reelplay 4 and 6). The original's
   `mediabuffered` stays empty for the local WebM, so its track has no buffer; the ports draw media-chrome's default
   `rgb(255 255 255 / .4)` buffer, which the theme would show with streaming media. The ports' time and preview text
   is greyscale-antialiased where the original's is subpixel; glyph positions identical. Together these are nearly
   all of the remaining differing pixels.
9. **Scrim image without a `base64()` helper** — positive. The 1×170 PNG was already an inline data URI in the
   template, so `skin.css` carries it verbatim and stays one file. The skin test checks it is the only `url()`, that it
   is a data URI, and that it appears byte for byte in `themes/demuxed-2022/template.html` when present.
10. **Accent maps onto the theme's tertiary colour** — positive. The theme already defined
    `--media-tertiary-color: var(--media-accent-color, #7596CC)` for thumbs and hover rings; the port's `--ps-accent`
    is `var(--media-accent-color, var(--media-tertiary-color, #7596cc))`. The catalogue's usual `--ps-primary` recipe
    would have been wrong here: this theme's `--media-primary-color` is its *black glyph* colour, so the accent must
    not reach it. Checked in `accent-hover` (thumb and play-button ring) and a scrubbed extra capture (thumb at 5s).
11. **Identical artwork for several states** — positive. Cast enter/exit, PiP enter/exit, fullscreen enter/exit and
    mute medium/high are identical in the original, so one glyph each; the test checks that the set of path data in
    both editions equals the original template's.
12. **Stream type is store-only** — papercut, upstream-worthy. v10 has `selectStreamType` (`streamTypeFeature`) but
    neither `media-container` nor any control reflects it, so a skin cannot write the theme's
    `[mediastreamtype=live]` rule on the video preset. A `data-stream-type` on the container would cover it.
13. **Poster hides after a paused seek; the container is the first tab stop** — papercut, known (notflix 10/11,
    reelplay 5). Seen in the extra `midway-accent` and `tab` captures.
14. **Font named, never loaded** — papercut. `sofia-pro, sans-serif` with no `@font-face`; both stacks fall back to the
    same sans-serif. The port keeps the stack behind `--media-font-family`.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original, threshold 60)

- **idle, hover, volume-hover, accent-hover:** every box identical in both editions at 360/720/1080. Differing pixels
  (≈ 800–3 100 per shot) are the buffered bar (entry 8) and text antialiasing; the hover ring on the play button and
  the mute button, the volume pill and the accent match.
- **scrub-hover:** as above; the preview time sits on the original's pixels and shows the same value.
- **playing, playing-inactive, paused-after-play:** differences from playback timing (e.g. 5.4 s vs 5.5 s frames and
  thumb position), the buffer and antialiasing; controls stay up under the pointer in all three panes (entry 3).
- **Extra states** (`scratchpad/demuxed-2022/extra.mjs`, 360/720): scrubbed accent, volume 0.3 and muted (glyphs,
  pill, thumb), captions button with a track, keyboard focus, autohide with the pointer away. Match except entry 13.

## Upstream-worthy

- `media-container` does not reflect the stream type (`streamTypeFeature`) (entry 12).
- Controls hide under a resting pointer; no `autohideovercontrols` equivalent (`media-controls`) — known gap 7 again.

## Time sinks

- Composite runs (≈ 4.5 min each); two were enough.
- Working out the rotated volume wrapper's real extent (border, `:last-child` margin, overflow) from the box dump.

## Positives

- Vertical volume slider, time group, slider thumb and preview mapped one to one; no script beyond the shared
  skin-element boilerplate.
- Box dump + pixel sampling settled every question (paint order included) without reading media-chrome's layout code.

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): hand-rolled shadow skin element, copied from minimal.
- Controls hide under a resting pointer (#7): `:has(:hover)` workaround (entry 3).
- Named icon slots become CSS, no default icons, v10 never forces `fill` (#2714): glyphs by data attribute, `fill` set.
- Breakpoints become container queries (#2714): one query at 600px.
- Buttons disagree about when to hide (#2714): generic `[data-hidden]`/`[data-availability]` rule last.
- Slider focus lives on the thumb (notflix 11): `:is(:focus-visible, :has(:focus-visible))` on both sliders.
- Poster hides after a paused seek, container is the first tab stop (notflix 10/11).

## Not verified

- Cast and AirPlay buttons (unavailable in headless Chromium; hidden in all panes, as in the original).
- Storyboard thumbnails (no storyboard in the test media); the error dialog visually.
- Fullscreen, touch input, Firefox and Safari (`:has()`).
- The 1080 and 600px-boundary layouts beyond the composite (the query is `< 600px`, media-chrome's `breakpointsm` is
  `>= 600`).

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.
