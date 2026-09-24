# yt — friction log

Port of `themes/yt` (Media Chrome edition 0.2.1) to `skins/yt`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS.
Date: 2026-09-24. Composite: [`../screens/yt.png`](../screens/yt.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

YT is the feature-heavy theme: settings menu with playback-speed, quality and subtitle submenus, chapter-aware progress
bar with thumbnail, chapter title and time preview, morphing play/mute glyphs, a centred seek/play/seek row on narrow
viewports, a play/pause flash on desktop, and tooltips (which the theme itself switches off). This log is mostly about
how v10's menu, tooltip, chapter and status primitives held up in a third-party skin.

## Scope

In: control bar (play, mute + volume, time, captions, settings, PiP, fullscreen), progress bar with chapters, pointer
track, thumbnail, chapter title and time preview, settings menu with three submenus, gradient, narrow-viewport centred
controls (`@media (width <= 768px)`, kept as a viewport query because the original's is one), desktop play/pause flash,
hotkeys and tap gesture, error dialog, poster slot, fullscreen sizes (`:fullscreen`), tooltips behind
`--media-tooltip-display` (default `none`, as in the original), `--media-accent-color`.

Out: the `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` host attributes (player-level
options in v10, not skin markup); the `mediacurrenttime^='0'` guard on the flash (the status indicator only fires on
input, so it needs no guard).

## Entries

1. **Menu offset variables are misnamed in the docs** — papercut, half an hour. `menu.mdx` and the HTML demo set
   `--media-menu-side-offset`; rc.2's positioner reads `--media-popover-side-offset` and `--media-popover-align-offset`
   on the menu element (`@videojs/core/dist/dev/core/ui/popover/vars.js`, `dom/ui/popover/positioning.js`). The menu
   sat on the bar's top edge until the debug dump showed the inline `bottom: calc(anchor(top) + var(--media-popover-side-offset, 0px))`.
   Worth filing: docs fix, or `MenuCSSVars` aliases.
2. **Popup measurement forces `height: auto` on items** — workaround. `createMenuPopup` measures the active page by
   re-measuring each child with `height: auto` (`dom/ui/menu/popup.js`), so the theme's fixed `height: 40px` items were
   measured at their content height and the popup came out 35px tall around a 40px item. `min-height` survives the
   measurement; the port uses that. Worth filing: honour `height` (or document that items must size with
   `min-height`/padding).
3. **A menu that is a direct child of `media-controls-content` inherits `pointer-events: none`** — workaround, the
   longest debugging session of the port. In the HTML edition the `<media-menu>` sits beside the bar inside the
   click-through controls layer; the popup renders in the top layer but still inherits `pointer-events: none`, so clicks
   on items fell through to the time slider underneath and the menu closed with `reason: "outside-click"`. React was
   unaffected only because `Menu.Popup` renders inside the bar, which re-enables pointer events. The port sets
   `pointer-events: auto` on `.ps-menu`. Worth filing: the popup could set `pointer-events: auto` itself, as it already
   sets `position`, `margin` and `translate` inline.
4. **`media-tooltip` creates children whose elements the `tooltip` entry does not register** — papercut, worth filing.
   With only `@videojs/html/ui/tooltip` imported, the element appends `media-tooltip-label`/`-shortcut` and then throws
   `labelEl?.setSyncedText is not a function` on every update, because the created elements are undefined custom
   elements. Importing `ui/tooltip-label` and `ui/tooltip-shortcut` fixes it. The skin's "every used element is
   registered" test cannot catch it since the tags never appear in the template; the harness's console-error report did.
   Either `ui/tooltip` should register its two parts, or the docs should list them as required imports.
5. **Menu align offset is not clamped to the boundary** — workaround with a caveat. The original pins the menu 12px from
   the player's right edge; v10 anchors it to the gear button, which has PiP and fullscreen to its right. The port pushes
   it past them with `--media-popover-align-offset: calc((pip + fullscreen) * button-width)` and drops each term with
   `:has(.ps-pip-button[data-hidden])` when the media cannot use the button. The positioner's `translate: clamp(...)`
   only clamps the *base* alignment; a CSS-variable offset is added outside the clamp, so a wrong offset would overhang
   the player. Worth filing: include the align-offset variable in the boundary clamp, or offer an `align-to` boundary.
6. **Unavailable captions button is force-hidden** — deliberate gap, worth filing. The theme keeps the CC button visible
   at 30% opacity when the media has no text tracks. v10 sets `data-availability="unavailable"` *and* the native
   `hidden` attribute on `media-captions-button` (`core/ui/captions-button/core.js`), so the only way to show it is to
   override `[hidden]`, which the port does not do. An opt-out (`keep-visible`) or leaving `hidden` to the skin's
   `[data-hidden]` rule would let themes dim instead of hide.
7. **Tooltips need ids in HTML** — papercut. A `<media-tooltip>` finds its trigger by `[commandfor=id]` or by being the
   next sibling. Media buttons must not carry `commandfor` (they would toggle the tooltip on click), and a sibling
   tooltip after the mute button breaks the `mute + slider` adjacency the volume reveal relies on, so the port gives
   each button an id and points the tooltip at it with `trigger="…"`. Ids inside the skin's shadow root are safe; the
   React edition needs none (`Tooltip.Trigger render={<PlayButton/>}`). The parity test had to exclude `yt-*` ids from
   its `ps-*` class scan.
8. **Tooltip label sync works for media buttons only** — positive with a gap. Linked to a media button the tooltip
   fills `media-tooltip-label` ("Play") and `media-tooltip-shortcut` ("K") itself and keeps them in step with state.
   For the plain settings `<button>` the label is authored text. No arrow part exists in the HTML edition
   (`Tooltip.Arrow` is React-only); media-chrome's tooltip drew one. Not ported.
9. **Status indicator reacts to input, not to state** — workaround. The original animates its centred play button
   whenever `mediapaused` flips (button, hotkey, click, API). `media-status-indicator` fires only for hotkey and gesture
   actions, so clicking the bar's play button shows no flash, and a repeated action restarts the timer without replaying
   the entry animation. Closest native equivalent; the flash is keyed on `data-status` with `close-delay="1000"` to
   match the 1s animation.
10. **Controls hide while the pointer rests on a control** — gap, worth filing. media-chrome keeps controls visible while
    the pointer is over chrome (`autohideovercontrols` opts out); v10's `media-controls` tracks pointer movement only, so
    a pointer parked on the centred play button sees the controls fade. The harness's `playing-inactive` column shows
    the original still visible for exactly this reason (its invisible centred desktop play button sits under the
    pointer), so that column is not a parity target.
11. **Chapters through a template** — positive. `<media-time-slider-chapters>` clones the track template per chapter and
    writes `--media-slider-chapter-start/end` inline; a `clip-path: inset()` on the clone reproduces media-chrome's
    segmented bar, with `:first-of-type`/`:last-of-type` dropping the outer 1px gaps. `data-highlighted` on the hovered
    chapter gives the 7px segment growth. Untested with real chapter cues (the test media has none): the single
    cue-less range renders as the original's plain bar.
12. **Pointer track** — positive. A plain `div` reading `--media-slider-pointer` inside the track reproduces media-chrome's
    `#pointer` layer; no primitive needed.
13. **Slider parts do not position themselves** — papercut, as in microvideo. Thumb `left`, fill/buffer widths and the
    preview's vertical offset are all the skin's to write from the `--media-slider-*` variables. The original's 20px hit
    area rises from a 5px strip; the port makes the slider root the hit area and pins the track and thumb to the old
    strip centre with `--ps-range-center`.
14. **Volume range gaps** — papercut. media-chrome's range keeps 10px of non-interactive gap inside its 70px box. The
    volume slider root cannot carry the padding (its `--media-slider-fill` percentage would be off), so a wrapper
    animates `width: 0 → 70px` and the 50px slider sits inside with `margin: 0 10px`.
15. **Flex trims the time separator's spaces** — papercut. `<media-time-separator> / </media-time-separator>` renders
    as `0:00/0:10` inside an inline-flex group; the port carries the spaces as `margin-inline: 0.28em`.
16. **Submenu focus ring after a mouse click** — papercut, not fixed. Opening a submenu focuses its first item by
    script, and Chromium then matches `:focus-visible` on the back header even though the user clicked. The v10 default
    skin has the same behaviour; the port keeps the ring for keyboard users rather than styling around it.
17. **Submenu height** — positive. Eight playback rates at 40px exceed a 405px-tall player; the popup caps itself at
    `--media-menu-available-height` and the page scrolls, which is what YouTube does. media-chrome capped at 300px.
18. **`Tooltip.Trigger render={…}` and `Menu.Trigger` compose** — positive. The settings button is
    `Tooltip.Trigger render={<Menu.Trigger …/>}`; the media buttons are `Tooltip.Trigger render={<PlayButton …/>}`.
    Props merge as expected and `aria-expanded` on the gear drives the 30° rotation in both editions.
19. **Radio-group templates** — positive. `<template>` with `data-part="label"` (`tier` for quality) and
    `renderItem(props, item)` in React gave identical items, and the `data-part="hint"` span in the parent item receives
    the selected label ("1×") without code. The original showed "1x"; v10 uses the multiplication sign.
20. **`SkinElement` still not exported, two packages with one name, container queries cannot match the container** — as
    microvideo entries 1, 2 and 4; nothing new.

## Time sinks

- Finding the real offset variable names and the `pointer-events` inheritance (entries 1 and 3): ≈ 40% of the port.
  Both needed a Playwright debug dump of the menu's inline style and `open-change` reasons.
- Reading media-chrome's menu, menu-item, range and time-range element styles to reproduce the settings menu (item
  padding `.4em .8em .4em 1em`, hover `rgb(92 92 102 / .5)`, back header border, check glyph, 30s seek icons).

## Not verified

- Chapters with real cues, storyboard thumbnails, quality and subtitle submenus with real tracks (the test media has
  none; the quality and subtitle items hide themselves through `data-availability`, as the original's
  `submenusize` rules did).
- Fullscreen sizes (54px bar, 320px menu, 20px thumb) beyond the CSS.
- Behaviour in Firefox and Safari: anchor positioning falls back to the JS path; PiP-unavailable align offset (entry 5).

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/yt.png`](../screens/yt.png).

### Theming tokens

The original already routed its red through `--media-accent-color`, with two defaults, so nothing changed beyond
naming the brand properties on the root and testing them.

| Token | What it colours | Default | Original |
| --- | --- | --- | --- |
| `--media-accent-color` | Progress fill (`--ps-accent`); thumb and captions-on underline (`--ps-accent-thumb`) | `rgb(229 9 20)`; `#f00` | Same surfaces, same defaults |
| `--media-primary-color` | Icons, text, volume fill and thumb, menu text, tooltips | `#fff` | Same |
| `--media-menu-background` | Settings menu, tooltips | `rgb(28 28 28 / 0.9)` | Fixed on the controller, not overridable |
| `--media-font-family` | All text | Roboto stack | Fixed on the controller, not overridable |
| `--media-tooltip-display` | Tooltips | `none` | Fixed on the controller, not overridable |

`--media-secondary-color` is not read: the original set it to `transparent` on its controller, so the only surface
that consulted it (`--media-control-hover-background`) was always transparent and a host value never reached it.
The test asserts both brand properties are declared on `.ps-yt` from `--media-accent-color`. Checked with
`?accent=00c853` at t = 5 s: fill, thumb and underline turn green in all three panes.

### Template conditionals

None in the original (the template's four `<template>` elements in the port are radio-group item templates).

### Reduced motion

The original has no `prefers-reduced-motion` rule (the play/pause flash, thumb scale and menu transitions always run);
the port has none either.

### Scope cuts

None new.

### New v10 gaps

None. The round touched only tokens, README and tests.
