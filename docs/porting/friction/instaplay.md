# instaplay — friction log

Port of `themes/instaplay` (Media Chrome edition 0.1.2) to `skins/instaplay`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS
(`apps/sandbox/templates/player-style-instaplay/` and `apps/sandbox/app/shared/player-style/react/instaplay.tsx`).
Date: 2026-09-24. Composite: [`../screens/instaplay.png`](../screens/instaplay.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

## Scope

The original is small: a centred play button shown only while paused (`centered-chrome`), a bar with a spacer and a
mute button, and a time range with a preview, all but the play button `noautohide`. One breakpoint (384px), no host
attribute variants, no stream-type branches (`defaultstreamtype="on-demand"`), no loading indicator. Everything is in
scope; the error dialog and media-chrome's default hotkeys come along as in microvideo.

## Entries

1. **The player takes the shape of its media** — workaround (against our own rule, not a v10 gap). The theme is
   designed for 9:16 video (`defaultAsset: portrait`) and, like every Media Chrome theme, sizes the box from the
   media. The catalogue rule and v10's packaged skins fix `aspect-ratio: 16 / 9`, which would letterbox portrait video
   into a landscape box. The port sets no aspect ratio and gives the root and the media `height: 100%`: with no height
   of its own that resolves to `auto` and the media's ratio sizes the box; with a height or `aspect-ratio` on the skin
   (host or `Container`) it fills and the media letterboxes. Checked in both editions (9:16 box around 16:9 media:
   container and video both 360×640). Before metadata the box is 300×150 (2:1), exactly as in the original. Not worth
   filing. **Site follow-up for the coordinator:** a preview card that assumes 16:9 will show this skin at the
   media's ratio; give it a portrait source or a sized box.
2. **No portrait source in the harness** — papercut. `capture.mjs` takes `--src`/`--poster`, but
   `apps/skin-compare/public/media` is 16:9 only and `make-media.mjs` has no size option. Generated a 360×640 WebM and
   poster with a scratch copy of `make-media.mjs` into a temporary folder under `skins/instaplay/`, served it through
   Vite's `/@fs/` path, captured with `--out` in the scratchpad, and deleted the folder. All three panes render a
   portrait player; idle, hover, volume-hover, and scrub-hover are pixel-identical to the original at 360/720/1080.
   Proposed: `make-media.mjs --portrait` writing `public/media/portrait.*` and a `capture --portrait` flag.
3. **Media-chrome button font vs the theme's font** — papercut, the main time sink. The theme sets `font-size: 16px`,
   but media-chrome buttons reset to 14px through their own `:host { font: … var(--media-font-size, 14px) … }`, and the
   theme's paddings and `--media-control-height: 1.2em` resolve against that (play 36.4px, mute 25.2px). The theme's
   `@container (inline-size >= 384px) { [role='button'], media-controller { font-size: 17px } }` bumps the buttons but
   never the controller, which cannot match its own container, so the bar margins (`.4em .8em`) and the preview margin
   (`.5em`) stay on 16px. The port puts 14px/17px on `.ps-button` and 16px on the root. Found by measuring the live
   original (bounding boxes through every shadow root) rather than reading the stylesheet; after that every box matched
   to the tenth of a pixel.
4. **`SkinElement` is not exported** (v10, as in microvideo) — workaround. `src/html/index.ts` is microvideo's element
   with the tag, class, and import list changed; ~80 identical lines per skin. Worth filing (already listed):
   export `SkinElement` or its template/style helpers from `@videojs/html`.
5. **Accent and primary are two colours here** — deliberate deviation (reverted in round 2, see below). The original uses `--media-primary-color`
   (white) for icons and `--media-accent-color` (at 75%) only for the scrubber's progress. In the `accent-hover`
   column the progress is empty (t = 0), so the original shows no change at all. Per the catalogue rule the port lets
   `--media-accent-color` drive the icons as well (`--ps-primary: var(--media-accent-color, var(--media-primary-color, #fff))`),
   and the progress follows it at 75% as in the original. The preview time keeps the theme's text colour.
6. **Always-visible controls** — positive. `Controls.Root`/`Controls.Content` with no `data-visible` rule is exactly
   `noautohide`; the container's `data-controls-visible` still flips after the idle delay, so `cursor: none` over the
   video while playing comes for free, as with media-chrome's `userinactive`.
7. **Centred play button** — positive. A `PlayButton` outside the controls, shown on `[data-paused]`, is the whole
   `centered-chrome` slot. v10's gesture coordinator never claims taps on interactive targets, so the button over the
   tap layer does not double-toggle.
8. **Taps between controls** — papercut. With `pointer-events: none` on the chrome, a tap in the empty part of the mute
   row reached the video and paused it; media-chrome's control bar swallowed those taps. The port gives `.ps-bar`
   `pointer-events: auto` (the chrome around it stays transparent), which matches the original's behaviour in a
   scripted click test of both editions.
9. **Mute glyphs are media-chrome's defaults** (v10: no default icons, known gap) — workaround. The theme ships only a
   play icon; the three volume glyphs come from `media-chrome/dist/media-mute-button.js`, `medium` drawn with the `low`
   glyph as media-chrome does. #2714's React draft used `@videojs/react/icons`, which has no low glyph and different
   artwork; replaced.
10. **#2714 drift from the original** — papercut. The draft's track sat 3px up from the slider's bottom rather than 2px
    down from its top (the scrubber showed 4px where the original shows 3px at 360px), its preview time used a
    `0 1px 2px` shadow instead of media-chrome's `0 0 4px rgb(0 0 0 / .75)`, and its preview fade had no in-delay. The
    port takes the original's values: 8px range at `bottom: -3px` (`-2px` from 384px), 4px track at `top: 2px`,
    preview 20px (0.5em from 384px) above the range, `.5s .25s` in / `.25s` out.
11. **Preview fade starts slightly earlier** (v10) — papercut, not worth filing. `data-pointing` is set on pointer
    entry; media-chrome waits for `mediapreviewtime` to round-trip through the controller. At the capture's 500ms the
    port's time chip is a little further into its fade (≈140 differing pixels at 360/1080, none at 720).
12. **Stylesheet test parser vs commas in at-rule preludes** — papercut. `tests/skin.test.ts` splits selector lists on
    commas before dropping `@` preludes, so `@supports (color: color-mix(in srgb, red, blue))` failed as bare tags
    `red`, `blue))`. The port drops the original's `@supports` fallback (every browser with container queries has
    `color-mix()`). Fix belongs in the test helper (strip preludes first), which lives in each skin's copy.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original)

- idle, hover, volume-hover: identical (0 differing pixels) at 360/720/1080, both editions.
- scrub-hover: identical at 720; the fade-phase difference in entry 11 at 360/1080.
- playing, playing-inactive, paused-after-play: differences only in video frames and progress width from playback
  timing (e.g. 5.4s vs 5.5s); layout, visibility, and autohide behaviour match.
- accent-hover: icons turned `#f5c518` in both ports; the original does not (entry 5; since round 2 the ports match).
- Portrait (9:16) media: idle, hover, volume-hover, scrub-hover identical in all three widths (entry 2).

## Time sinks

- Working out which font size each `em` resolves against (entry 3). The live-DOM measurement settled it in one pass;
  worth making a harness script.
- Building portrait media by hand (entry 2).

## Not verified

- Storyboard thumbnails: no test storyboard; the thumbnail box, radius, and shadow come from media-chrome's defaults.
- The error dialog: styled from media-chrome's built-in dialog without a visual check.
- Keyboard focus rings, and touch behaviour (tap-to-toggle is mouse-only, as in microvideo; media-chrome's touch tap
  shows/hides controls, which does nothing visible here since the chrome never hides).

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/instaplay.png`](../screens/instaplay.png).

### Theming tokens

The original already routed its brand colour through `--media-accent-color` (`--_accent-color`, the scrubber's
progress at 75%), so per the round 2 rule nothing new is wired: `--ps-accent: color-mix(in srgb,
var(--media-accent-color, #fff) 75%, transparent)` on `.ps-instaplay` is the brand property, now tested.

**Reverted round 1 entry 5.** Round 1 let the accent colour the icons too
(`--ps-primary: var(--media-accent-color, var(--media-primary-color, #fff))`). The original coloured icons with
`--media-primary-color` only (`--media-icon-color: var(--_primary-color)`), so the port now does the same
(`--ps-primary: var(--media-primary-color, #fff)`); a test pins it. Consequence for the site picker: on an idle
preview at t = 0 the accent changes nothing visible, exactly as in the original; once the video has progress, the
scrubber takes the colour.

| Token | What it colours | Default | Original |
| --- | --- | --- | --- |
| `--media-accent-color` | Scrubber progress, at 75% | `#fff` | Same |
| `--media-primary-color` | Play and mute icons; preview time and dialog text (via `--media-text-color`) | `#fff`; `rgb(238 238 238)` | Same |
| `--media-secondary-color` | Round button surface at 75% (hover: 85% of that) | `rgb(38 38 38)` | Same |
| `--media-font-family` | Preview time, dialog | media-chrome's Helvetica Neue stack | Same (media-chrome default) |

The error dialog text was a literal `rgb(238 238 238)`; it now follows `--media-text-color` / `--media-primary-color`
like media-chrome's dialog. Checked with `?accent=00c853` at t = 5 s: the progress turns green in all three panes and
the icons stay white in all three.

### Template conditionals

None in the original.

### Reduced motion

The original has no `prefers-reduced-motion` rule (preview fade, button hover transition); neither does the port.

### Scope cuts

None new.

### New v10 gaps

None.
