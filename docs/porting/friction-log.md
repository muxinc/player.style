# Friction log

## Status

3 of 14 themes ported (microvideo, instaplay, yt); the other 11 are scaffolded under `skins/*` as placeholders.
Updated 2026-09-24.

One row per skin; the per-skin logs hold the detail. Severity: blocker / workaround / papercut.

| Skin | Status | Blockers | Workarounds | Log | Screens |
| --- | --- | --- | --- | --- | --- |
| microvideo | ported (on-demand layout; live and `controlbarplace` variants out of scope) | none | duplicate workspace package name; hand-rolled shadow skin element (`SkinElement` not exported); preview offset | [friction/microvideo.md](friction/microvideo.md) | [screens/microvideo.png](screens/microvideo.png) |
| instaplay | ported (on-demand; sizes to its media, portrait verified) | none | hand-rolled shadow skin element (`SkinElement` not exported); no fixed aspect ratio (sizes to media); accent also drives icons; media-chrome default mute glyphs inlined; portrait test media generated ad hoc (now the harness `aspect` option) | [friction/instaplay.md](friction/instaplay.md) | [screens/instaplay.png](screens/instaplay.png) |
| yt | ported (on-demand; settings menu, chapters, tooltips opt-in via `--media-tooltip-display`) | none | menu offset variables; menu items sized with `min-height`; popup `pointer-events: auto`; menu align offset past PiP/fullscreen; tooltip label/shortcut imports; status indicator in place of the pause flash | [friction/yt.md](friction/yt.md) | [screens/yt.png](screens/yt.png) |

Integration pass (2026-09-24): the three ports' React stylesheets collided on the gallery (bare `.ps-*` selectors from
one skin restyled the others; microvideo's play glyph filled its card). Every selector is now scoped with
`:where(.ps-<name>)`, which adds no specificity, and each skin test guards it.

## v10 gaps worth filing upstream

Deduplicated across the per-skin logs, most costly first. Gaps already reported by #2714 are in the list below this one.

1. `ui/tooltip` creates `media-tooltip-label`/`-shortcut` without registering them, then throws `setSyncedText is not a function` on every update (`@videojs/html/ui/tooltip`) — workaround — yt.
2. Menu/popover popups inherit `pointer-events: none` from `media-controls-content` in the top layer, so item clicks fall through and close the menu (`dom/ui/menu/popup.js`) — workaround — yt.
3. `SkinElement` (or its shadow-style/template helpers) is not exported, so every HTML edition hand-rolls ~40–80 lines (`packages/html/src/presets/skin.ts`) — workaround — microvideo, instaplay, yt.
4. Docs name `--media-menu-side-offset`; rc.2 reads `--media-popover-side-offset`/`--media-popover-align-offset` (`core/ui/popover/vars.js`, `menu.mdx`) — papercut — yt.
5. The align-offset variable is added outside the positioner's boundary clamp, so an offset menu can overhang the player (`dom/ui/popover/positioning.js`) — workaround — yt.
6. Popup page measurement forces `height: auto` on items, mis-sizing fixed-`height` items (`dom/ui/menu/popup.js`) — workaround — yt.
7. Controls auto-hide while the pointer rests on a control; no `autohideovercontrols` equivalent (`media-controls`) — workaround — yt.
8. Unavailable captions button gets native `hidden` as well as `data-availability`, so a theme cannot dim it instead (`core/ui/captions-button/core.js`) — workaround — yt.
9. `media-status-indicator` fires on hotkey/gesture input only, not on `paused` changes from buttons or the API, and a repeat does not replay the entry (`StatusIndicator`) — workaround — yt.
10. No low-volume glyph in `@videojs/react/icons` and no media-chrome-parity icon set; themes that relied on default mute glyphs inline them (`@videojs/react/icons`) — papercut — instaplay.
11. `media-slider-preview` positions from the slider root and shows on `data-pointing` before the preview time settles, shifting chips and fades against media-chrome (`media-slider-preview`) — papercut — microvideo, instaplay.
12. `Tooltip.Arrow` exists in React only; the HTML edition has no arrow part (`media-tooltip`) — papercut — yt.

## Pre-existing v10 gaps, reported by videojs/v10#2714

From the PR's `apps/sandbox/app/shared/player-style/README.md` and description; they apply to every port.

- Named icon slots become CSS: every glyph renders, data attributes hide the wrong ones.
- v10 never forces `fill` onto skin artwork; SVGs shipped with `fill="none"` render blank until the skin sets fill.
- `--media-icon-size` is internal; skins outside the package size icons themselves.
- Sprite sheets (`<use href="#id">`) must come across with the skin.
- Volume level is reported on the mute button only.
- No reflected numeric state (`mediacurrenttime`, `mediavolume`); only `--media-slider-*` custom properties.
- Binary assets need inlining at author time; there is no build-time `base64()`.
- Named slots need a shadow-DOM skin (hence the shadow-DOM HTML edition here).
- Opt-in controls (`display: var(--media-x-display, none)`) are easy to miss in a theme's stylesheet.
- Artwork can carry several states in one SVG (`yt`); v10 leaves it alone.
- media-chrome ships default icons; v10 does not.
- Breakpoints become container queries.
- `targetLiveWindow` is in store state but not reflected, so live themes cannot branch on DVR vs. standard latency.
- Buttons disagree about when to hide: airplay/fullscreen on `availability !== 'available'`, captions on
  `unavailable`, cast on `unsupported`, pip on `!actionable`; cast can render as a dead control.
- Media Chrome and `@videojs/html` register eleven identical tag names; both must never share a document.
- From the migration guide: no configurable autohide delay, no `defaultduration`, no volume/mute persistence, no
  `seektoliveoffset`, no player-level active chapter, no cue points.
