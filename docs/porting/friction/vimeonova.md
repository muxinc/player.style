# vimeonova — friction log

Port of `themes/vimeonova` (Media Chrome edition 0.1.2, by @luwes) to `skins/vimeonova`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup and CSS
(`apps/sandbox/templates/player-style-vimeonova/theme.html`, `theme.css`). Date: 2026-09-24. Composite:
[`../screens/vimeonova.png`](../screens/vimeonova.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Vimeonova is a mid-sized theme: a 65×40 play button beside a translucent 32px bar, two progress bars (a 5px strip above
the bar below 484px, a 10px track inside it from 484px), always-on current-time and hover-time chips with arrows, a
rotated volume range that pops up above the mute button, three separate menus (captions, playback rate, rendition), a
title/byline header, and a striped "buffering" track. Two breakpoints: 384px (play button leaves the centre) and 484px
(progress moves into the bar).

## Scope

In: every element of the template (header, centred and bar play buttons, both ranges with their `current` and
`preview` boxes and arrows, thumbnail, captions/rate/rendition menus and triggers, mute + vertical volume, PiP, AirPlay
with media-chrome's default glyph, Cast, fullscreen), both `@container` breakpoints, `--media-primary-color`,
`--media-secondary-color`, `--media-accent-color`, the buffering stripes, the error dialog, the named `poster` slot,
hotkeys and the mouse tap gesture, auto-hide including "stay up while a control is hovered".

Out: the `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` host attributes (player-level
options in v10); `--media-tooltip-display: none` (the theme switches tooltips off, so the port renders none); the SD and
4K rendition glyphs (the template carries them with a static `hidden` class and no script ever shows them, so only HD is
ported).

## Entries

1. **The harness scrubs the first range, which vimeonova hides above 484px** — papercut, harness-side. `capture.mjs`'s
   `hoverTarget()` takes `locator(selector).first()`, and in both the original and the port the first
   `media-time-range`/`.ps-range` is the 5px strip that is `display: none` from 484px. `boundingBox()` returns null and
   the `scrub-hover` cell is silently skipped at 720 and 1080 for all three panes. The port keeps the original's DOM
   order (the strip first) and covers scrub at every width with a per-skin script (`filter({ visible: true })`).
   Upstream-worthy for this repo: `apps/skin-compare/scripts/capture.mjs` should filter to visible matches.
2. **No primitive for an always-visible, clamped "current time" box** — workaround. media-chrome's `media-time-range`
   has a `current` slot box that follows the progress and clamps to `--media-box-padding-*`. v10 has
   `media-slider-value type="current"` but nothing positions it. The port uses a *second* `media-slider-preview`
   (`.ps-current`) and remaps `--media-slider-pointer: var(--media-slider-fill)` on it, so the preview's own inline
   `left: min(max(0px, calc(var(--media-slider-pointer) - w/2)), calc(100% - w))` follows the fill and clamps with its
   measured width. It works in both editions with no script. Upstream-worthy: a `follow="fill|pointer"` option on
   `media-slider-preview` / `TimeSlider.Preview` (`core/dom/ui/slider/css-vars.js` `getSliderPreviewStyle`).
3. **media-chrome's box positions use the range's padded box** — workaround, took a measurement pass. With
   `padding-inline: 10px` on the large range, media-chrome places both chips at `rangeLeft + ratio × rangeWidth`
   (padding included), so at 0% the chip centres 10px left of the track and at 50% it sits 7px behind the fill end.
   A v10 slider's hit area should be the track (the pointer percentage comes from the root's box), so the root carries
   `margin-inline: 10px` and a `.ps-rail` that reaches 10px past each end holds the chips. Result: chips land on the
   original's pixels at 0%, 18% and 50%.
4. **Arrows are a separate, unclamped element** — papercut. media-chrome draws `[part=arrow]` boxes in the same slot
   as each chip; the chip clamps, the arrow does not (on the strip it stops 4px inside the ends). The port draws each
   arrow as a zero-size bordered `div` at `left: var(--media-slider-fill|pointer)`, clamped with `clamp(4px, …)` on
   the strip.
5. **v10 reports a buffered range the original never draws** — deliberate difference. The theme sets
   `--media-time-range-buffered-color: dimgray`; in the harness media-chrome's `mediabuffered` stays empty even though
   `video.buffered` is `[0, 10]` (it only listens for `progress`, which fired before it attached), so the original's
   track looks empty. v10 fills `--media-slider-buffer` from the media, so the port shows the dimgray buffer the theme
   asked for. Visible in every idle/scrub cell as a grey bar; not a v10 gap.
6. **Playback rates are player state, not skin config** — papercut. v10's default list is
   `0.2 0.5 0.7 1 1.2 1.5 1.7 2` (`dom/store/features/playback-rate.js`); media-chrome's was `1 1.2 1.5 1.7 2`. The skin
   cannot narrow it without filtering items, so the rate menu has eight rows (it scrolls on a 202px-tall player, as
   the original's five did). v10 also labels rates `1×`; the port passes `formatRate` → `1x` (React prop on
   `PlaybackRateRadioGroup.Root`; in HTML a property set after `customElements.upgrade(root)`, because `formatRate` is
   a class field, not a declared reactive property, so a pre-upgrade assignment is overwritten). Upstream-worthy:
   a `format`/`rates` attribute on `media-playback-rate-radio-group`.
7. **Menu opens with the checked row highlighted** — papercut. v10 focuses the checked radio item on open and sets
   `data-highlighted`; media-chrome only paints on `:hover`. The port paints on `:hover` and keeps the focus ring for
   keyboard users. The v10 menu also scrolls the checked row into view on a short player (the original starts at the
   top).
8. **Menu triggers hide themselves** — positive. A `media-menu` holding a `media-quality-radio-group` or
   `media-captions-radio-group` sets `hidden`/`data-availability` on whichever element points at it with `commandfor`
   (`dom/ui/menu/element.js` `#syncOptionState`), so a plain `<button>` quality trigger drops out when there are no
   renditions, exactly as media-chrome's `mediarenditionunavailable`. `media-playback-rate-button commandfor` and
   `Menu.Trigger render={<PlaybackRateButton/>}` give the `1x` text through `content: attr(data-rate) "x"`.
9. **Menu placement** — positive. `side="top" align="start"` plus `--media-popover-side-offset: 7px` (10px below
   484px) lands the rate menu on the original's pixels (left edge on the trigger, bottom 7–8px above the bar) with no
   align offset, and `pointer-events: auto` on `.ps-menu` avoids the known fall-through.
10. **Controls hide under a resting pointer** — workaround, known gap #7. The original's 360px `playing-inactive` keeps
    everything up because the harness pointer rests on the centred play button. The port keeps the layer opaque with
    `.ps-layer:not([data-visible]):not(:has(.ps-play-button:hover, .ps-bar-right:hover))` and only disables pointer
    events under the same condition, so the hovered control stays hovered. Matches the original in that column; the
    v10 cursor and `data-controls-visible` still report idle.
11. **Title yes, byline no** — workaround. `media-title` / `Title` resolve the player's `content-title` / `title`
    (`metadataFeature`) and hide when empty, a clean match for `{{mediatitle}}`. There is no byline metadata, so the
    HTML edition takes a named `byline` slot (styled through `::slotted(*)`) and React a `byline` prop. Verified
    pixel-equal against the original with `mediatitle`/`mediabyline` set (HTML only; the React harness cannot pass a
    title). Upstream-worthy: an `artist`/`byline` field in `metadataFeature`.
12. **Buffering state is only on the indicator** — workaround. The original stripes the track on
    `[medialoading]:not([mediapaused])`. v10 exposes buffering as `data-visible` on `media-buffering-indicator` (500ms
    delay built in), so the port renders an empty, `display: none` indicator purely as a state source and styles
    `.ps-vimeonova:has(.ps-buffering[data-visible]) .ps-track` with the original's 10px SVG stripe tile. Not captured
    (the local media never stalls). Upstream-worthy: `data-waiting`/`data-buffering` on `media-container`.
13. **Captions menu trigger** — unverified. Mirrors v10's own live skin: `media-captions-button commandfor` in HTML,
    `Menu.Trigger render={<CaptionsButton/>}` in React. The test media has no text tracks, so the button stays hidden
    in every capture, as the original's did.
14. **Poster hides after a paused seek** — papercut, v10 behaviour. Seeking a never-played video to 50% hides v10's
    poster (the frame shows); media-chrome kept its poster until playback. Not skin-controllable (`media-poster`
    decides `data-visible`); only visible in the extra `midway` state.
15. **The theme's volume track variable does not exist** — papercut. The theme sets
    `--media-range-track-background-color`, which media-chrome never reads, so the original shows the default
    `rgb(255 255 255 / 0.2)` track. The port ports the effect (the default), per best-practices' "invalid CSS is part of
    its look".
16. **Vertical volume without rotation** — positive. `media-volume-slider orientation="vertical"` / `orientation` prop
    replaces the original's `rotate(-90deg)` wrapper and its 16px transparent border hover bridge; a `::after` bridge
    keeps the pointer path from button to pill. Pixel-equal at 360/420/720/1080.
17. **Shadow-DOM skin element, `slot` class parity** — papercut. The test's bare-tag guard forbids `slot.ps-byline`, and
    a class shared by the `<slot>` and React's `<span>` would give the empty slot element the chip box, so the slot gets
    its own `ps-byline-slot` class, listed as HTML-only in the parity test.

## Time sinks

- Measuring media-chrome's chip geometry (entries 2–4): about a third of the port. Settled by a box dump of the live
  original's shadow roots and 2–3× crops of the bottom-left corner.
- Discovering the missing 720/1080 scrub cells (entry 1) and writing a visible-only extra-state script.
- A glyph-visibility slip: a `.ps-button .ps-icon { display: block }` rule outranked the per-state `display: none`
  rules, so every mute/PiP/fullscreen glyph rendered at once in the first composite.

## Positives

- `media-title`, `media-playback-rate-button`, the self-hiding menu triggers, and the vertical volume slider mapped
  one-to-one; no script beyond the shared skin-element boilerplate and one `formatRate` assignment.
- Re-using `media-slider-preview` for the always-on chip kept both editions declarative and identical.
- The header, the 420px intermediate layout, the menus, the volume pill, and both chips match the original to the pixel.

## Known gaps hit again

- `SkinElement` not exported: hand-rolled shadow skin element again (~80 lines) — friction-log #3.
- Menu popups inherit `pointer-events: none`: `pointer-events: auto` on `.ps-menu` — friction-log #2.
- `--media-popover-side-offset` rather than the documented `--media-menu-side-offset` — friction-log #4.
- Controls hide under a resting pointer — friction-log #7 (worked around here, entry 10).
- Container queries cannot match the container: responsive tokens on `.ps-layer` — best-practices.
- Named icon slots become CSS, no default icons (AirPlay glyph inlined from media-chrome) — #2714 list.

## Not verified

- React header (title/byline): the harness cannot pass `title` or `byline`; HTML verified.
- Captions and quality menus with real tracks/renditions; storyboard thumbnails; buffering stripes during a stall.
- Firefox and Safari (`:has()`, anchor-positioning fallback of the menus).

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.
