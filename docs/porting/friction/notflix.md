# notflix — friction log

Port of `themes/notflix` (Media Chrome edition 0.1.2) to `skins/notflix`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS
(`apps/sandbox/templates/player-style-notflix/theme.html` and `theme.css`). Date: 2026-09-24. Composite:
[`../screens/notflix.png`](../screens/notflix.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

## Scope

The original is a two-row chrome at the bottom: a time bar (time range + remaining time) over a control bar (play,
seek -10/+10, mute with a vertical volume range that appears on hover, a `title` slot / `mediatitle`, a captions menu
button and menu, fullscreen), plus the default loading indicator and error dialog. Everything scales from
`--media-font-size`, which steps 10 → 12 → 14 → 16px at `breakpoints="sm:384 md:576 lg:768 xl:1440"` (sm changes
nothing); md also moves the menu (15px inset, 25px above the bar) and gives the title `padding-right: 15%`. No
`:host([attr])` variants, no stream-type branches (`defaultstreamtype="on-demand"`), no partials.

In: all of the above, `--media-accent-color` (the theme already used it for its red), `--media-primary-color`,
`--media-font-family`, poster slot, title slot, media-chrome's default hotkeys and tap gesture.

Out: the `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` host attributes (player
options in v10, as in yt); `--media-tooltip-display: none` needs no port (no tooltips at all); `--media-secondary-color`
is declared by the theme but never used.

## Entries

1. **Measure first paid off again** — positive. A shadow-root-walking box dump of the live original at 360/720/1080
   (instaplay's method) gave every value: 0.4em time bar, 10px range gaps, 0.25em/0.4em track, 1em thumb, 5em bar with
   3.8em buttons, a 7em × 1.5em volume panel at `left: 1.25em; bottom: calc(100% - 0.7em)`, the preview 0.8em + 5px
   above the strip. The first draft matched every box of the original to 0.1px at 720 (play, seeks, mute, title,
   fullscreen, remaining time, track, thumb, volume panel). #2714's draft had most values but a 2em time bar, a 1.4em
   slider, `system-ui` type and a centred title; replaced with the measured ones.
2. **Vertical volume slider instead of a rotated range** — positive. The original rotates a horizontal
   `media-volume-range` by -90°. v10 sliders take `orientation="vertical"` (`VolumeSlider.Root orientation`), so the
   port draws the panel upright and positions the fill/thumb from `--media-slider-fill` along the height. A scripted
   click at 25% of the track set `volume` to 0.25 in all three stacks.
3. **Captions menu button → plain button + `media-menu`** — positive. v10 has no captions *menu button*; a
   `<button commandfor>` with a `media-menu` holding `media-captions-radio-group` works, and the menu pushes the radio
   group's `hidden` / `data-availability` onto its trigger (`dom/ui/menu/element.js` `#syncOptionState`), so the
   button disappears without text tracks exactly as media-chrome's did. React needs `CaptionsRadioGroup.Root` around
   both `Menu.Trigger` and `Menu.Popup` for the same effect. Checked with a `<track>` injected from a `data:` VTT URL:
   "Subtitles" header, "Off"/"English", check mark, grey/white item colours match the original at all three widths.
4. **Menu pinned to the player edge, not the button** — workaround. media-chrome's anchored menu gets `right: 10px`
   (15px from md) from the theme, i.e. relative to the player, past the fullscreen button. v10 anchors to the trigger,
   so the port adds `--media-popover-align-offset: 0.4em + 3.8em (fullscreen) - inset` and zeroes the fullscreen term
   with `:has()` when that button is hidden (yt's pattern). The vertical `margin-bottom: 15px/25px` maps directly to
   `--media-popover-side-offset`. Positions match the original to the pixel in the extra-state shots. The align offset
   still sits outside the positioner's clamp (known gap 5).
5. **`em` inside the offset variable resolved at the menu** — papercut, 15 minutes. The menu's own font size is 1.2em,
   and an unregistered custom property substitutes `em` where it is used, so `calc(3.8em …)` came out 20% too far. The
   port multiplies the layer's px `--ps-font-size` instead. Plain CSS, not a v10 gap, but every scaled theme with a
   menu will hit it.
6. **Opening a menu by pointer highlights its checked item** — papercut, worth a look upstream. On open v10 moves
   focus and `data-highlighted` to the checked radio item, so styling `[data-highlighted]` like `:hover` (as yt does)
   painted a hover band media-chrome never showed on a pointer open. The port styles `:hover` only and keeps the
   `:focus-visible` ring for keyboards (`dom/ui/menu/content.js`: highlight could follow input modality).
7. **Remaining-time toggle goes to duration, not current time** — workaround. `media-time-display remaining` toggles
   remaining ↔ current on click; v10 `media-time type="remaining" toggle` toggles remaining ↔ duration, and
   `type="current" toggle` starts on current (`core/ui/time/core.js` `#toggleType`). The port keeps `toggle` (closest
   native equivalent, same tab stop and focus ring); after one click the original shows `0:00`, the port `0:10`.
   Worth filing: a `toggle-type` / `alternate` option.
8. **Title** — positive. `media-title` / `Title` render the metadata feature's title (`content-title` on
   `<video-player>`, `title` on `VideoPlayer`) and hide themselves when there is none. The HTML edition wraps it in a
   `title` slot, so `<span slot="title">` behaves as in the original (checked side by side, ellipsis-free clipping at
   360 included); React has no slots, so the component takes a `mediaTitle` node instead.
9. **Buffered bar: the harness, not the theme** — papercut (also found by the minimal port). The original's `#buffered`
   stays at 0px in every capture: media-chrome's controller never sets `mediabuffered` for the fully preloaded test
   WebM, although `video.buffered` is `[0, 10]`. The ports draw the theme's `#d3d3d3` buffered bar, so every shot with
   the time bar differs from the original along the track (≈ 800 px at 720 once masked, 2 000 at 1080). Kept, since
   with streaming media the original shows it too.
10. **Poster disappears on a paused seek** — papercut, worth filing. v10's `PosterCore` hides the poster once playback
    has `started`, which a seek while paused already sets; media-chrome keeps it until `mediahasplayed`. Visible only in
    the extra `seek-accent` shot (ports show the 4s frame, the original the poster). Not the skin's to fix
    (`core/ui/poster/core.js`, playback `started`).
11. **Slider focus lives on the thumb** — papercut. Tabbing into `media-time-slider` focuses `media-slider-thumb`, so
    `.ps-range:focus-visible` never matches; the port uses `:is(:focus-visible, :has(:focus-visible))` and turns the
    thumb's own outline off. The container is also the first tab stop in both v10 editions (the original starts at the
    range); v10 behaviour, left alone.
12. **Preview sits 2–4px right of the original** — papercut, as known gap 11. media-chrome positions the preview over
    the range box including its 10px gaps; v10 positions it over the slider root (the track). Not corrected.
13. **Scaled em sizing is easy in v10** — positive. The whole theme is `em` off one font size, so one container query
    per breakpoint setting `--ps-font-size` on `.ps-layer` reproduces all four steps; nothing else is breakpoint-aware.
14. **`SkinElement` still not exported; default spinner inlined** — as microvideo; nothing new.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original)

- idle, hover, volume-hover, accent-hover: every control box identical; the only differing pixels are the buffered
  bar (entry 9), at all three widths and in both editions.
- scrub-hover: as above, plus the preview offset (entry 12). Pointer line, grown track, preview time box and text match.
- playing, paused-after-play: buffered bar and playback timing (1.8s vs 1.9s frames); layout identical.
- playing-inactive: 0 differing pixels in the HTML edition at every width and in React at 360; React at 720/1080
  differs only by the video frame (5.4s vs 5.5s playback timing). Controls hide in all three.
- Extra states (`scratchpad/notflix/extra.mjs`): subtitles menu open (Off / English checked), volume low/muted glyphs
  and fill, title slot, focus order and toggle; matches except entries 6 (fixed), 7, 10 and 11.

## Known gaps hit again

- `SkinElement` not exported (gap 3): hand-rolled shadow element copied from yt.
- Menu offset variables (gap 4): used `--media-popover-side-offset`/`--media-popover-align-offset` directly.
- Align offset outside the boundary clamp (gap 5): menu shifted past the fullscreen button with `:has()` terms.
- Menu popup `pointer-events` (gap 2): set `pointer-events: auto` on `.ps-menu` pre-emptively.
- Slider preview positioning (gap 11): 2–4px offset.
- media-chrome default icons (pre-existing): loading spinner inlined.
- Named slots need a shadow-DOM skin, breakpoints become container queries, icon state by data attribute
  (pre-existing, #2714).

## Time sinks

- Reading media-chrome's range, time-range and menu styles for the gap, hit-zone, arrow and menu-positioning details
  before the measurement dump made most of it unnecessary.
- Working out why the menu sat 20% too far right (entry 5).

## Not verified

- Storyboard thumbnails (no test storyboard); the loading spinner under a real stall; the error dialog visually.
- Fullscreen and the 1440px step (16px) beyond the CSS.
- React `mediaTitle` and `VideoPlayer title` in the harness (its React pane takes no props); the HTML `content-title`
  path was checked by script.
- Firefox and Safari.

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/notflix.png`](../screens/notflix.png).

### Theming tokens

The original already routed its red through `--media-accent-color` (`--_accent-color`), so the brand property
`--ps-accent: var(--media-accent-color, #ea3323)` on `.ps-notflix` stays as it was; the test now asserts it.

| Token | What it colours | Default | Original |
| --- | --- | --- | --- |
| `--media-accent-color` | Progress fill and thumb, volume fill and thumb | `#ea3323` | Same |
| `--media-primary-color` | Icons, title, remaining time, menu header and check, loading spinner, error dialog text | `#fff` | Same (the controller re-declared it from `--_primary-color`) |
| `--media-font-family` | All text | media-chrome's Helvetica Neue stack | Same (media-chrome default) |

`--media-secondary-color` is not read: the original declared `--_secondary-color` and never used it; every panel is
a fixed `rgb(38 38 38)` and control backgrounds are `transparent`, which shadows media-chrome's own secondary
fallbacks. One fix: the error dialog text was a literal `#fff`; it now follows `--media-primary-color`, as
media-chrome's dialog did. Checked with `?accent=00c853` at t = 5 s with the volume panel open: both fills and thumbs
turn green in all three panes.

### Template conditionals

One: `<template if="mediatitle"> {{mediatitle}} </template>` inside the `title` slot. **Ported** in round 1:
`media-title` (`Title` in React) renders the player's content title and hides itself when there is none, which is the
branch's condition; the `title` slot (HTML) and `mediaTitle` prop (React) replace it as the original's slot did. The
`.ps-title` box stays in the bar either way, as the original's `media-text-display` did, so the layout does not shift.

### Reduced motion

The original has no `prefers-reduced-motion` rule (icon scale on hover, volume panel fade); neither does the port.

### Scope cuts

None new.

### New v10 gaps

None.
