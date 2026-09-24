# sutro-audio — friction log

Port of `themes/sutro-audio` (Media Chrome edition 0.0.8, "Sutro Audio" by @muxinc, `audio: true`) to
`skins/sutro-audio`, the first theme on the Video.js **audio** preset (`<audio-player>` / `AudioPlayer`). Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup
(`apps/sandbox/templates/player-style-sutro-audio/theme.html`, `theme.css`). Date: 2026-09-24. Composite:
[`../screens/sutro-audio.png`](../screens/sutro-audio.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Sutro Audio is a rounded deep-blue card (`#17507B`, 16px radius) lit by two blurred white blobs
(`filter: blur(80px)`, `mix-blend-mode: plus-lighter`, 24% opacity). Below 480px it is a stacked card: square artwork
with the title and byline over a 100px black gradient, a centred bar (rate, back 10, play, forward 10, mute), then
elapsed time, a small scrubber and the total time. From 480px (`breakpoints="md:480"`) it becomes one 84px row of
three equal grid columns (52px artwork and text, the bar, right-aligned times) with a second scrubber flush against the
bottom edge. Icons are 1px strokes in a 32-unit box drawn at 40px; the play and mute glyphs animate between states.
No menus, no tooltips (`--media-tooltip-display: none`), no loading indicator, no error dialog, no autohide (the
`audio` controller never hides its controls).

The port measures box-for-box identical to the original at 360/720/1080 (card, layout columns, every button, both
slider tracks and thumbs, times, preview box, to the tenth of a pixel) in both editions.

## Scope

Inventory of `themes/sutro-audio/template.html` and `git show media-chrome:site/themes/sutro-audio.md`:

- **Elements:** two background SVGs; `.controls` (info: poster slot + gradient, `{{mediatitle}}` / `{{mediabyline}}`;
  `media-control-bar` with `media-playback-rate-button`, seek backward/forward (10s), play, mute; `.times` with
  `media-time-display`, small `media-time-range`, `media-duration-display`); big `media-time-range` with
  `media-preview-time-display`. All in.
- **`:host([attr])` variants:** none. **`<template if>`:** `mediatitle`, `mediabyline` (in: `media-title` + a
  `byline` slot/prop, entry 5). **Breakpoints:** `md:480` only (in, as `@container ps-sutro-audio (inline-size >=
  480px)`).
- **`--media-*`:** `--media-primary-color` (icons, title; media-chrome also feeds it to text and the wide scrubber),
  `--media-secondary-color` (card), `--media-font-family` (buttons, times, title). All honoured, plus
  `--media-accent-color` in front of the primary colour.
- **Site `themeProps`:** `className: '@[480px]:h-[98px]'`, i.e. the old site forced 98px from 480px up. The card fills
  any sized host, as the original did; the harness leaves it unsized (446px tall at 360px, 84px from 480px), so the
  composite compares intrinsic heights. The README says so.
- **Out:** `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` (player options in v10).
  Media-chrome's default hotkeys are mapped to `media-hotkey` (Space, k, m, arrows); no fullscreen or captions keys on
  audio.

## Entries

1. **The harness audio path mostly worked; two gaps** — workaround (harness). `kind: 'audio'` already routed the
   panes to `<audio slot="media">` / `<audio-player>` / `AudioPlayer` + `Audio` and `media/tone.webm`, and element
   screenshots taller than the viewport (the 446px card in a 266px viewport) capture whole. Missing: (a) `scrub-hover`
   hit the first `media-time-range`/`.ps-range` in DOM order, which from 480px is the hidden small scrubber, so the
   column was blank at 720/1080 (vimeonova hit the same with its swapped progress bars and scripted around it);
   (b) the dev page sized every iframe as 16:9, cutting the 446px card off at 360px. Both fixed; see "Harness changes".
2. **The original's wide scrubber is unreachable** — deliberate difference. `.controls` is `position: relative;
   z-index: 1` and covers the whole 84px card, so it paints over the absolutely positioned big `media-time-range`
   (`z-index: auto`). `elementFromPoint` on the range returns `div.controls`, a click on it leaves `currentTime` at 0,
   and the preview time never shows. The port gives `.ps-big-range` `z-index: 2`, so it hovers, drags and shows the
   13px preview time 3px above the pointer as the theme evidently intended. Visible only in the `scrub-hover` column
   from 480px (the ports show `0:03`; the original shows nothing).
3. **Artwork crop** — deliberate difference. The original styles the slotted poster with `object-fit: cover;
   aspect-ratio: 1` but no width, so the image lays out at its natural width (640×640 for the harness's 640×360
   poster) and the 52px/328px box shows its top-left corner; with real album art of any size above the box, the card
   shows a corner of it. The port fills the square (`width/height: 100%; object-fit: cover`, centred, with
   `--media-object-position`). This is the whole artwork region of every composite row (37% of it differs at 360px,
   98% at 720/1080); everything outside it matches. Reproducing it would take `width: auto; max-width: none` on the
   image.
4. **No `media-controls` layer** — positive. The audio preset has no `controlsFeature`, and the original never hid its
   controls, so the port renders the bar and times as plain `div`s inside `media-container` (no `media-controls` /
   `Controls.Root`, no `data-visible` rules). The `playing-inactive` column confirms nothing fades. v10's own audio
   skin uses `Controls.Root visibility="always"`, which rc.2's element does not document; not needed here.
5. **Title yes, byline no** — workaround, as vimeonova entry 11. `media-title` / `Title` resolve `content-title` /
   `AudioPlayer title` (`metadataFeature` is in `audioFeatures`); there is no byline/artist in the store, so HTML takes
   a `byline` slot (`.ps-byline-slot::slotted(*)`) and React a `byline` prop (`.ps-byline`). Verified pixel-equal
   against the original with `mediatitle`/`mediabyline` set, at 360 (text over the artwork gradient) and 720 (beside
   the 52px artwork), HTML only. Upstream-worthy, and more so for audio: an `artist`/`byline` field in
   `metadataFeature` (`@videojs/core/dom/store/features/metadata`); audio players show an artist far more often than
   video players show a byline.
6. **Artwork is `media-poster`, but poster semantics are video semantics** — papercut. `PosterCore` sets
   `data-visible` only until playback starts (`visible: !started`), which is right for a video frame and wrong for
   album art. The port simply never keys on `data-visible`, and the `src` stays after playback starts, so it works; a
   skin that copied microvideo's `.ps-poster:not([data-visible]) { display: none }` would lose its artwork on play.
   Upstream-worthy: a documented "artwork" use of `Poster` on the audio preset, or an `Artwork` alias that stays
   visible (`core/ui/poster/core.js`).
7. **Rate button has no text and cycles a longer list** — workaround. `media-playback-rate-button` renders nothing and
   reflects `data-rate`; `::after { content: attr(data-rate) "x" }` reproduces media-chrome's `1x` label (bold 14px,
   `min-width: 5ch`, measured 38.9px wide in both). The store's `playbackRates` are fixed at
   `0.2 0.5 0.7 1 1.2 1.5 1.7 2` with no config (`dom/store/features/playback-rate.js`), so after `2` the button goes
   to `0.2` where media-chrome returned to `1`. Upstream-worthy: a `rates` config on the playback-rate feature or a
   `rates` attribute/prop on the button. Verified `1x` → `1.2x` in all three panes.
8. **State animations port verbatim** — positive. The play triangle's scale-in bounce and the pause bars' font-size
   squash (`width="1em"` on `<rect>`) key on `data-paused`; the mute waves and the two-stroke cross wipe key on
   `data-volume-level` (`off`/`low`/`medium`/`high`, the same four words as media-chrome's `mediavolumelevel`). Ids
   became classes so several React players on one page do not repeat ids; the test guards it. Keyframes are prefixed
   (`ps-sutro-audio-bounce-*`) because the React stylesheet is global.
9. **Small scrubber padding and hover highlight** — papercut, as minimal entry 7. media-chrome's range keeps 10px of
   dead space either side of the track inside the range box; v10 maps the pointer to the slider root, so the root takes
   `margin-inline: 10px` (track 247.5px at 360, same as the original). media-chrome's hover highlight (`#pointer`,
   `--media-range-track-pointer-background`) has no v10 part; the port draws it as `.ps-track::before` with
   `width: var(--media-slider-pointer)` on `[data-pointing]`, with media-chrome's 0.5s fade. It is barely visible in
   the composite because the ports also draw the buffered range (entry 10).
10. **Buffered range drawn only by the ports** — papercut (harness). The tone reports `buffered` `[0, 9.9]`, but the
    original's controller never sets `mediabuffered` (the range's attribute stays empty), so its tracks stay at 20%/25%
    white while the ports draw the theme's own 40%/30% buffered colour across the whole track. With the artwork, this is
    the only pixel difference in the idle, hover, volume and paused columns (the 690×4px track is the whole 4.8% at 720).
11. **`light-dark()` does not reach a third-party skin** — positive / note. v10's audio theme
    (`packages/skins/src/styles/audio/theme.css`) defines its surfaces with `light-dark()` on
    `.media-skin[data-preset="audio"]`, so the packaged audio skins follow the page's `color-scheme`. A port does not
    import that stylesheet, so nothing flips; Sutro Audio is a fixed dark card, and the root sets `color-scheme: dark`
    so native parts (React `<button>` focus rings, any UA widget) render for a dark surface whatever the page uses.
12. **`--media-font-family` resolves in two places** — papercut. The theme sets `font-family: Roboto, Arial, sans-serif`
    on the controller (layout text, 15px) but `--media-font-family: Roboto, helvetica neue, segoe ui, arial,
    sans-serif` for media-chrome's buttons and time displays (bold 14px and regular 14px). Both stacks are copied
    verbatim; Roboto is missing in the container, so the harness renders the fallbacks in all three panes alike.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original, artwork box excluded)

| Width | idle / hover / volume / scrub | playing / inactive / paused | accent-hover |
| --- | --- | --- | --- |
| 360 | 1.4% (HTML and React) | 0.9–1.3% | 3.2% (accent is ignored by the original) |
| 720 | 4.8–5.0% | 2.2–4.0% | 6.4% |
| 1080 | 4.8–4.9% | 2.2–3.9% | 5.8% |

The residue is the buffered track (entry 10) and, in `scrub-hover` from 480px, the preview time (entry 2). HTML and
React rows are identical to each other within timing noise. The artwork box differs by entry 3.

## Upstream-worthy (v10 file / primitive)

- Byline/artist metadata: `metadataFeature` (`@videojs/core/dom/store/features/metadata`), entry 5.
- Poster as persistent artwork on the audio preset: `PosterCore` (`core/ui/poster/core.js`), entry 6.
- Configurable playback rates: `playbackRateFeature` (`dom/store/features/playback-rate.js`) or
  `media-playback-rate-button`, entry 7.
- A slider pointer-highlight part (or documenting `--media-slider-pointer` for it): `media-slider-track`, entry 9.

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): the HTML edition hand-rolls the shadow root again (~70 lines).
- Named icon slots become CSS (#2714): one SVG per button here, with state carried by per-path classes.
- v10 never forces `fill` (#2714): `.ps-icon` sets `fill: none` and the stroke explicitly; the seek numbers take
  `fill: currentColor`.
- Breakpoints become container queries (#2714): one, `md:480`, with the min-height on `.ps-layout` because the
  container cannot match itself.
- Volume level on the mute button only (#2714): fine, one mute button.
- No reflected numeric state (#2714): not needed; the theme keys nothing on `mediacurrenttime`.
- Range padding becomes a margin (minimal #7): the small scrubber.
- Scrub the visible range (vimeonova): now fixed in `capture.mjs`.

## Harness changes

- `apps/skin-compare/scripts/capture.mjs`: `hoverTarget()` now picks the first *visible* match
  (`locator(selector).filter({ visible: true }).first()`). Video skins whose first match was already visible hover the
  same element as before; skins that swap controls by width get a `scrub-hover` shot instead of none. `pnpm
  compare:skin microvideo` re-run afterwards: same composite apart from playback-timing noise (restored with
  `git checkout`).
- `apps/skin-compare/src/index.ts` (dev page only): for `kind: 'audio'`, each iframe follows its document's height
  (`ResizeObserver` on the pane body) instead of a 16:9 guess. Video panes are unchanged.
- No change needed to `original.html`/`html.html`/`react.html`, `params.ts`, `react.tsx`, or `make-media.mjs --audio`:
  the audio branches written with the `kind` option work as documented (`tone.webm` plays; all eight states run).

## Time sinks

- Working out why the original's wide scrubber showed no preview (entry 2): the capture looked like a timing problem
  until `elementFromPoint` showed the controls row on top.
- Deciding the artwork crop (entry 3): measuring showed the 640×640 slotted image; the fix is one line, the decision
  was the time.
- One `pnpm lint` run fails on another port's in-progress `skins/x-mas/src/react/index.tsx`; path-scoped
  `vp lint skins/sutro-audio apps/skin-compare` is clean.

## Positives

- The audio preset composes exactly like video: `media-container data-preset="audio"`, the same `ui/*` elements, the
  same data attributes. No audio-specific element was needed.
- Measured layout matched on the first capture: the theme's `--base` scale and media-chrome's defaults (40px controls,
  14px bold buttons, `min-width: 5ch` rate, 10px range padding, 13px preview time with `3.5px 9px` padding) are enough
  to port without eyeballing.
- `mix-blend-mode: plus-lighter` blobs behave the same in the shadow root and in React's light DOM once the root has
  `isolation: isolate`.

## Not verified

- React title and byline (the harness cannot pass `AudioPlayer title` or the `byline` prop); HTML verified.
- Dragging either scrubber (the `[data-dragging]` dim of the info and bar to 40%) beyond a hover; CSS mirrors the
  original's `:has(media-time-range[dragging])`.
- Keyboard focus rings; the hotkeys.
- The 98px sized-host look from 480px in the ports (the original was checked at 98px: content centres vertically; the
  port uses the same `height: 100%` chain).
- Firefox and Safari (`:has()`, `plus-lighter`, `backdrop-filter` on the small track).

## Proposed best-practice additions

- **Pick the visible control in hover scripts.** When a theme swaps controls by width, filter with
  `{ visible: true }`; `capture.mjs` now does.
- **Check that the theme's controls can be reached.** A theme's `z-index` can bury a control under a sibling row
  (sutro-audio's wide scrubber). `elementFromPoint` plus a click in an extra-state script settles it; port the intent
  and log the difference.
- **Measure slotted images.** An `aspect-ratio` on an unsized slotted `<img>` lays it out at its natural width; decide
  whether to port the crop or the intent, and say which.

### Audio themes

- **Panes.** Set `kind: 'audio'` in `skins.ts`. The original gets `<audio slot="media">`, the HTML port
  `<audio-player><name-skin><audio src></audio><img slot="poster"></name-skin></audio-player>`
  (`@videojs/html/audio/player`), React `<AudioPlayer poster><NameSkin><Audio src /></NameSkin></AudioPlayer>`
  (`@videojs/react/audio`), all playing `media/tone.webm` (`make-media.mjs --audio`). The template root is
  `<media-container ... data-preset="audio">`; register the same `@videojs/html/ui/*` modules as for video.
- **No controls layer unless the theme hid its controls.** `audioFeatures` has no controls feature and media-chrome's
  `audio` controller never auto-hides; lay the bar out in plain elements and expect `playing-inactive` to equal
  `playing`.
- **Artwork is `media-poster` / `Poster.Root` + `Poster.Image`**, filled from the slotted `<img slot="poster">` or
  `AudioPlayer poster`. Never hide it on `:not([data-visible])`: that attribute drops when playback starts.
- **Height follows content; width drives layout.** No `aspect-ratio`. Give the root `height: 100%` (content height
  in an unsized host, fills a sized one) and put the theme's `min-height` on a descendant inside the container query.
  Record the old site's `themeProps` height in the README (sutro-audio: 98px from 480px) rather than baking it in, so
  the harness compares intrinsic heights with the original.
- **Hide the media element.** `.ps-<name> > audio, .ps-<name> ::slotted(audio) { display: none }`; the skin test's
  "styles the media twice" check should look for `audio`.
- **Titles and bylines:** `media-title` / `Title` for the title; a `byline` slot (HTML) and prop (React) for the
  artist, as vimeonova.
- **`light-dark()` and `color-scheme`.** v10's audio theme colours come from `light-dark()` in its own stylesheet,
  which a port does not load, so a port's colours are fixed unless it writes `light-dark()` itself. A fixed dark card
  sets `color-scheme: dark` on the root so native parts match it; a theme that should follow the page writes its
  tokens as `light-dark(<light>, <dark>)` and sets `color-scheme: light dark`.

## Summary row

| sutro-audio | ported (audio preset; stacked card below 480px, one row with edge scrubber above; artwork, title, byline) | none | wide scrubber made reachable (original buried it under the controls row); artwork fills its square (original showed the image's top-left corner); rate label via `data-rate` and v10's fixed rate list; byline slot/prop; hover highlight as a track pseudo-element; hand-rolled shadow skin element; harness: visible hover target, audio iframe height | [friction/sutro-audio.md](friction/sutro-audio.md) | [screens/sutro-audio.png](screens/sutro-audio.png) |
