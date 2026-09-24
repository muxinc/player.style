# Friction log

One row per skin; the per-skin logs hold the detail. Severity: blocker / workaround / papercut.

| Skin | Status | Blockers | Workarounds | Log | Screens |
| --- | --- | --- | --- | --- | --- |
| microvideo | ported (on-demand layout; live and `controlbarplace` variants out of scope) | none | duplicate workspace package name; hand-rolled shadow skin element (`SkinElement` not exported); preview offset | [friction/microvideo.md](friction/microvideo.md) | [screens/microvideo.png](screens/microvideo.png) |

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
