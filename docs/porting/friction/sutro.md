# sutro — friction log

Port of `themes/sutro` (Media Chrome edition 0.2.1) to `skins/sutro`. Based on
[videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the initial markup and CSS.
Date: 2026-09-24. Composite: [`../screens/sutro.png`](../screens/sutro.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Sutro is Mux's flagship theme: one full control bar with stroked outline icons, frosted buttons (`backdrop-filter`), a
volume pill that swings up above the mute button, a settings menu with playback-speed, quality and subtitle submenus,
tooltips on every button, a thumbnail/chapter/time preview, AirPlay and Cast, and a single `--base` scale (18px, 20px
from 480px, 24px in fullscreen). Everything is sized from that variable, so the port is mostly a translation of
media-chrome element defaults into `calc(n * var(--ps-base))`.

## Scope

In: control bar (play, mute + volume pill, time, progress with chapters, pointer track, thumbnail and chapter and time
preview, captions, settings, PiP, AirPlay, Cast, fullscreen), tooltips (on by default, mute excluded as the original's
`notooltip`), the settings menu with three submenus, gradient, breakpoint `md:480` (base 20px; below it the duration,
captions and PiP drop out), fullscreen base 24px, hotkeys and tap gesture, error dialog, poster slot,
`--media-accent-color` on the progress fill, thumb and volume fill.

Out: the `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` host attributes (player-level
options in v10); the empty `centered-chrome` slot; the original's "hide the volume range until `mediavolume` is set"
guard (v10 reflects no volume value, and the pill is hidden until hover anyway); the `[keyboardcontrol]` rules
(`:focus-visible` and `:focus-within` cover them).

## Entries

1. **Menu popup measured while rotated** — workaround, the one real detour. The theme closes (and so opens) its menu
   with `translateY(20px) rotate(3deg)`. Ported as the popup's `[data-starting-style]` transform, the menu came out
   58px tall around a 32px item instead of 49px: `createMenuPopup` measures each page's children with
   `getBoundingClientRect` at open time (`@videojs/core` `dom/ui/menu/popup.js`, `measureContent`), and a 182px-wide
   item rotated 3° has a 41px-tall bounding box. The rotation is dropped; the drop-in stays. Worth filing: measure
   with `offsetHeight`, or neutralise the popup's transform while measuring.
2. **Tooltip `delay` on the group is shadowed** — workaround. media-chrome's tooltips fade in on hover with no delay;
   v10's open after 600ms. `<media-tooltip-group delay="0">` did nothing: the element defaults its own `delay` to 600,
   and `dom/ui/tooltip/tooltip.js` resolves `options.delay?.() ?? group?.delay`, so the group's value is never reached.
   Each `<media-tooltip>` carries `delay="0"` and each `Tooltip.Root` `delay={0}`. Worth filing: leave the element's
   `delay` undefined so the group's applies, or document that the group only shares timing between tooltips.
3. **Menu offset when React renders no button** — workaround, extends yt entry 5. The original pins its menu 10px from
   the player's right edge; v10 anchors it to the gear, so the align offset counts the buttons after the gear. yt
   subtracted hidden buttons with `:has(.ps-pip-button[data-hidden])`; that fails here because AirPlay and Cast are
   `null` in React when unusable (no element, nothing to match), and the menu overhung the player by 80px in the React
   edition only. The terms now default to 0 and `:has(.ps-x-button:not([hidden], [data-hidden], [data-availability=…]))`
   raises each to 1; the PiP term is multiplied by a `--ps-menu-md` flag the sub-480px container query zeroes, since a
   plain override loses to the `:has()` rule's specificity.
4. **Menu items inherit the bar's line height** — papercut. The theme's items are `height: 1.6 × base` with a 2 × base
   line height inherited from `--media-control-height` (they overflow and media-chrome does not care). v10 items must
   size with `min-height` (yt entry 2), and `min-height` cannot override a 40px line box, so the items get
   `line-height: 1` and flex centring. The back header keeps the 2 × base line to reproduce media-chrome's 52px header.
5. **Thumb stayed visible after a pointer seek** — papercut. yt's `[data-interactive]` selector for the thumb kept it
   visible after clicking the range (the attribute outlives the pointer while the slider has focus). The original shows
   the thumb on `:hover` only; the port uses `:hover` and `[data-dragging]`.
6. **Authored `<media-tooltip-label>` suppresses the shortcut** — positive. With only `@videojs/html/ui/tooltip` the
   element appends a label and a shortcut ("K") to every tooltip; Sutro shows the label alone. Placing
   `<media-tooltip-label>` inside the tooltip (and `Tooltip.Label` in React) keeps the synced label and creates no
   shortcut. The settings button's label is authored text in both editions.
7. **No arrow part in the HTML tooltip** — papercut, as yt entry 8. A `::after` triangle on `.ps-tooltip` gives both
   editions the original's 12 × 5px arrow. media-chrome also shifted the arrow to stay over the button when the
   tooltip was clamped by `--media-tooltip-container-margin` (18px); v10 exposes no shift, so the arrow of an edge
   button's tooltip sits under the tooltip's centre instead of the button's. Left as is.
8. **Tooltip text differs** — papercut, not fixed. v10 labels read "Enter fullscreen" where media-chrome read "Enter
   fullscreen mode"; the label comes from v10's translations, so the skin does not own it.
9. **Backdrop-filter band over live video** — parity, not a gap, but it cost a debugging pass. Once the poster is gone
   Chromium paints a lighter band under the play and mute buttons (the blur's sampling region). The original's
   `playing` shot has the same band, so the ports leave `backdrop-filter: … opacity(0)` as the theme wrote it.
10. **Volume pill** — positive. The original's `media-mute-button:hover + .wrapper` adjacency survives because mute has
    no tooltip; the `media-volume-slider` root is the pill itself (10 × base by base, `overflow: hidden`, rounded), so
    the fill clips to the corners and no thumb is needed. The original left its thumb at opacity 0.
11. **One scale variable** — positive. `--ps-base` lives on the root's children (`:where(.ps-sutro) > *` inside the
    container query, `.ps-sutro:fullscreen > *` for fullscreen) because the container cannot answer its own query;
    every child, including the top-layer menu and tooltips, inherits it.
12. **Time display** — positive. The original's two `media-time-display`s (current; current / duration) become one
    `media-time-group` whose separator and duration hide under 480px.
13. **Captions button** — parity by accident. The theme dims the CC button to 30% without subtitles, but the live
    original renders no captions button at all (media-chrome's captions button hides itself), so v10's forced `hidden`
    (yt entry 6) matches here.
14. **Playback rates** — papercut, content not skin. v10 offers eight rates (0.2× to 2×, multiplication sign) where
    media-chrome offered five (1x to 2x); the submenu is taller and scrolls at 360px.
15. **Cast renders as a dead control on `unavailable`** (v10#2714 known gap) — hidden with the availability rules, as
    microvideo entry 13.
16. **Invalid CSS as part of the look** — noted. The theme's `stroke-linecap: 'round'` is quoted and so ignored; the
    port keeps butt caps. The `<use class="svg-shadow">` on the mute button sits outside its `<svg>` and never
    rendered; not ported.
17. **Known gaps hit again** — `SkinElement` not exported (microvideo 2); popover offset variable names (yt 1); menu
    `pointer-events` in the HTML controls layer (yt 3); `ui/tooltip-label` and `ui/tooltip-shortcut` imports (yt 4);
    align offset outside the boundary clamp (yt 5); submenu focus ring after a click (yt 16); no reflected volume value
    (#2714).

## Time sinks

- Measuring the live original (bar, menu, submenu, tooltip, volume pill geometry at 360 and 720) before writing CSS:
  about a third of the port, and the reason the first composite already matched.
- The 9px menu height (entry 1) and the tooltip delay (entry 2): each needed a read of the v10 source.

## Not verified

- Fullscreen base 24px, AirPlay and Cast buttons, storyboard thumbnails, chapters and the quality and subtitle submenus
  with real tracks (headless Chromium offers none).
- Firefox and Safari (anchor positioning falls back to the JS path; `backdrop-filter` rendering).

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.
