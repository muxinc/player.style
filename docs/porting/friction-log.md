# Friction log

## Findings

- **Verdict:** no blockers across 14 themes; each ships HTML and React editions on Video.js 10.0.0-rc.2, box-for-box
  with its Media Chrome original at 360/720/1080 apart from logged deviations (mostly the accent reaching more colour).
- **Recurring costs:** a hand-rolled shadow skin element (all 14); media-chrome defaults v10 leaves to the skin (range
  padding and hit zones, preview geometry, 14px button font), settled by measuring the live original; chrome that
  hides under a resting pointer (5); menu plumbing (pointer events, offsets, popup measurement).
- **Went well:** data-attribute state, container queries, real thumbs, vertical sliders, `media-title`, self-hiding
  menu triggers, context instead of `mediacontroller`, and an audio preset that composes exactly like video.
- **Top upstream fixes:** export `SkinElement`; keep controls up while the pointer rests on them; let menu popups own
  `pointer-events`, clamp the align offset, and measure pages untransformed.
- **Harness artifacts, not v10 bugs:** the media-chrome original never gets the local WebM's buffered range
  (`mediabuffered` stays empty); headless Chromium has no H.264 (the site's MP4/HLS previews error there).

## Status

14 of 14 themes ported; all are registered on the site. Updated 2026-09-24.

One row per skin, in site order; the per-skin logs hold the detail. Severity: blocker / workaround / papercut.

| Skin | Status | Blockers | Workarounds | Log | Screens |
| --- | --- | --- | --- | --- | --- |
| yt | ported (on-demand; settings menu, chapters, tooltips opt-in via `--media-tooltip-display`) | none | menu offset variables; menu items sized with `min-height`; popup `pointer-events: auto`; menu align offset past PiP/fullscreen; tooltip label/shortcut imports; status indicator in place of the pause flash | [friction/yt.md](friction/yt.md) | [screens/yt.png](screens/yt.png) |
| sutro | ported (on-demand; tooltips on, settings menu, volume pill, AirPlay/Cast when available) | none | menu entry transform flattened (popup measured while rotated); per-tooltip `delay="0"`; `:has()` counts rendered buttons for the menu offset; authored tooltip label; thumb on hover/drag only | [friction/sutro.md](friction/sutro.md) | [screens/sutro.png](screens/sutro.png) |
| minimal | ported (on-demand; per-breakpoint control sets via container queries; title via `media-title`; live out of scope) | none | per-breakpoint control sets as container queries; opt-in controls gated inside the query; range padding as margin; seek-number weight; hand-rolled shadow skin element (`SkinElement` not exported) | [friction/minimal.md](friction/minimal.md) | [screens/minimal.png](screens/minimal.png) |
| notflix | ported (on-demand; subtitles menu, title slot, vertical volume) | none | menu pinned past fullscreen via align offset; remaining-time toggle goes to duration; hand-rolled shadow skin element; `em`-free offset token | [friction/notflix.md](friction/notflix.md) | [screens/notflix.png](screens/notflix.png) |
| vimeonova | ported (on-demand; three menus, header, buffering stripes; tooltips off as in the original) | none | hand-rolled shadow skin element; second slider preview as the current-time chip; chip rail for media-chrome's padded-box geometry; `formatRate` after upgrade; byline slot/prop; hover keeps controls up; menu `pointer-events: auto` | [friction/vimeonova.md](friction/vimeonova.md) | [screens/vimeonova.png](screens/vimeonova.png) |
| instaplay | ported (on-demand; sizes to its media, portrait verified) | none | hand-rolled shadow skin element (`SkinElement` not exported); no fixed aspect ratio (sizes to media); accent also drives icons; media-chrome default mute glyphs inlined; portrait test media generated ad hoc (now the harness `aspect` option) | [friction/instaplay.md](friction/instaplay.md) | [screens/instaplay.png](screens/instaplay.png) |
| microvideo | ported (on-demand layout; live and `controlbarplace` variants out of scope) | none | duplicate workspace package name; hand-rolled shadow skin element (`SkinElement` not exported); preview offset | [friction/microvideo.md](friction/microvideo.md) | [screens/microvideo.png](screens/microvideo.png) |
| reelplay | ported (on-demand; 16:9; artwork inlined as data URIs) | none | inlined PNG artwork (no `base64()`); handle nudges via thumb `aria-valuenow`; slider gaps as margins in a sizing wrapper; accent drives the fills (original ignores it); hand-rolled shadow skin element | [friction/reelplay.md](friction/reelplay.md) | [screens/reelplay.png](screens/reelplay.png) |
| demuxed-2022 | ported (on-demand; 16:9; one 600px breakpoint; tooltips off as in the original; live out of scope) | none | hand-rolled shadow skin element; hover keeps chrome up; flat-tree paint order via DOM order; vertical volume pill with the original's invisible hover box; range wrapper as media-chrome's range box | [friction/demuxed-2022.md](friction/demuxed-2022.md) | [screens/demuxed-2022.png](screens/demuxed-2022.png) |
| halloween | ported (on-demand; 16:9; animated spider and candle; artwork inlined as SVG data URIs) | none | hidden mute button as volume-level carrier; spider/flame animation boxes spanning the old range; padded preview rail; hover keeps chrome up; accent drives the spun web (original ignores it); hand-rolled shadow skin element | [friction/halloween.md](friction/halloween.md) | [screens/halloween.png](screens/halloween.png) |
| x-mas | ported (on-demand; inline SVG artwork with SMIL animations; one 600px breakpoint; live out of scope) | none | hand-rolled shadow skin element; no tap gesture and hover keeps chrome up (original's full-size centred chrome); upright vertical volume slider drawn rotated; accent drives the candy canes (original ignores it); React mask ids via `useId` | [friction/x-mas.md](friction/x-mas.md) | [screens/x-mas.png](screens/x-mas.png) |
| winamp | ported (video preset kept; fixed 275 × 264 bitmap skin; artwork inlined incl. animated VU GIF; marquee as CSS animation) | none | 23 bitmaps inlined as data URIs (89.8 KB `skin.css`); tap gesture scoped with `data-interactive`; fullscreen shows the screen alone via `:has()`; marquee as keyframes; accent drives the LCD text (original ignores it); hand-rolled shadow skin element | [friction/winamp.md](friction/winamp.md) | [screens/winamp.png](screens/winamp.png) |
| sutro-audio | ported (audio preset; stacked card below 480px, one row with edge scrubber above; artwork, title, byline) | none | wide scrubber made reachable (original buried it under the controls row); artwork fills its square (original showed the image's top-left corner); rate label via `data-rate` and v10's fixed rate list; byline slot/prop; hover highlight as a track pseudo-element; hand-rolled shadow skin element; harness: visible hover target, audio iframe height | [friction/sutro-audio.md](friction/sutro-audio.md) | [screens/sutro-audio.png](screens/sutro-audio.png) |
| tailwind-audio | ported (audio preset; strip + 80px bar below 448px, one 64px rounded bar above; Tailwind utilities hand-translated to plain CSS) | none | Tailwind utilities and preflight translated by hand to `ps-*` CSS; sprite inlined; 20px slider hit zone via `::before`; media-chrome flex shrink at 448px; composited preview for antialiasing; rate label via `data-rate`; hand-rolled shadow skin element | [friction/tailwind-audio.md](friction/tailwind-audio.md) | [screens/tailwind-audio.png](screens/tailwind-audio.png) |

Integration pass (2026-09-24): the three ports' React stylesheets collided on the gallery (bare `.ps-*` selectors from
one skin restyled the others; microvideo's play glyph filled its card). Every selector is now scoped with
`:where(.ps-<name>)`, which adds no specificity, and each skin test guards it.

## v10 gaps worth filing upstream

Deduplicated across all 14 logs; ordered by severity (blocker, workaround, papercut), then by the number of skins that
hit the gap. Items already reported by #2714 are in the next list. No blockers.

1. `SkinElement` (or its shadow-style/template helpers) is not exported, so every HTML edition hand-rolls 40–80 lines (`packages/html/src/presets/skin.ts`) — workaround — all 14.
2. Poster follows playback `started`: it hides after a paused seek, reappears after a rewind to 0, and has no persistent "artwork" mode for audio (`core/ui/poster/core.js`) — workaround (sutro-audio), papercut — notflix, reelplay, vimeonova, demuxed-2022, halloween, x-mas, winamp, sutro-audio.
3. Controls auto-hide while the pointer rests on a control; no `autohideovercontrols` equivalent, and `userActive` stays false while hovered (`media-controls`) — workaround — yt, vimeonova, demuxed-2022, halloween, x-mas.
4. Menu/popover popups inherit `pointer-events: none` from `media-controls-content` in the top layer, so item clicks fall through and close the menu (`dom/ui/menu/popup.js`) — workaround — yt, notflix, vimeonova, sutro.
5. Stream type is store-only (`streamTypeFeature`); no `data-stream-type` on `media-container`, so live variants on the video preset were dropped — workaround — microvideo, minimal, demuxed-2022, x-mas.
6. The popover align-offset variable is added outside the boundary clamp, so an offset menu can overhang the player (`dom/ui/popover/positioning.js`) — workaround — yt, notflix, sutro.
7. Playback rates are fixed at eight with no `rates` config, and `formatRate` on `media-playback-rate-radio-group` is a non-reactive class field (`dom/store/features/playback-rate.js`) — workaround — vimeonova, sutro-audio, tailwind-audio (papercut: yt, sutro).
8. Popup page measurement forces `height: auto` on items and measures bounding rects, so fixed-height items and rotated/scaled entry transforms mis-size the popup (`dom/ui/menu/popup.js` `measureContent`) — workaround — yt, sutro.
9. `ui/tooltip` creates `media-tooltip-label`/`-shortcut` without registering them, then throws `setSyncedText is not a function` (`@videojs/html/ui/tooltip`) — workaround — yt, sutro.
10. No byline/artist field in `metadataFeature`; skins add a `byline` slot and prop (`core/dom/store/features/metadata`) — workaround — vimeonova, sutro-audio.
11. `media-gesture` taps cover the whole container; no `target` option, and `data-interactive` (the opt-out) is undocumented (`core/dom/gesture/coordinator.js`) — workaround — winamp, x-mas.
12. Slider hit area is the root box; no hit-zone knob (`--media-time-range-hover-height`) and no pointer-highlight part (`media-time-slider`, `media-slider-track`) — workaround — sutro-audio, tailwind-audio.
13. Volume level and muted state are reported on the mute button only; `media-volume-slider` could reflect `data-volume-level`/`data-muted` (`core/ui/volume-slider/core.js`) — workaround — halloween.
14. No supported numeric hook for slider values; the thumb's `aria-valuenow` is the only one (`core/ui/slider/core.js`) — workaround — reelplay.
15. No always-on, clamped current-time box; a `follow="fill"` option on `media-slider-preview` would do it (`core/dom/ui/slider/css-vars.js`) — workaround — vimeonova.
16. Buffering is reflected only on `media-buffering-indicator`; `data-buffering` on `media-container` would avoid a hidden state carrier — workaround — vimeonova.
17. `media-container` reflects no `data-fullscreen`, and a skin cannot name the fullscreen target (`fullscreenFeature`, `ContainerDataAttrs`) — workaround — winamp.
18. `media-time type="remaining" toggle` toggles to duration, not current time; no toggle-type option (`core/ui/time/core.js`) — workaround — notflix.
19. Unavailable captions button gets native `hidden` as well as `data-availability`, so a theme cannot dim it (`core/ui/captions-button/core.js`) — workaround — yt.
20. `media-status-indicator` fires on hotkey/gesture input only, not on `paused` changes from buttons or the API, and a repeat does not replay the entry (`StatusIndicator`) — workaround — yt.
21. Tooltip group `delay` is shadowed by the element's own default of 600ms (`dom/ui/tooltip/tooltip.js`) — workaround — sutro.
22. `media-slider-preview` positions from the slider root, not media-chrome's padded range box, and shows on `data-pointing` before the preview time settles (`media-slider-preview`) — papercut — microvideo, instaplay, notflix, halloween, x-mas, tailwind-audio.
23. Docs name `--media-menu-side-offset`; rc.2 reads `--media-popover-side-offset`/`--media-popover-align-offset` (`core/ui/popover/vars.js`, `menu.mdx`) — papercut — yt, notflix, vimeonova, sutro.
24. No media-chrome-parity icon set and no low-volume glyph in `@videojs/react/icons`; default mute, spinner and AirPlay glyphs were inlined — papercut — instaplay, minimal, notflix, vimeonova.
25. A menu opened by pointer highlights and focuses its checked item; highlight could follow input modality (`dom/ui/menu/content.js`) — papercut — notflix, vimeonova.
26. `Tooltip.Arrow` exists in React only, and no arrow shift is exposed when a tooltip is clamped (`media-tooltip`) — papercut — yt, sutro.
27. Submenu opened by mouse shows a `:focus-visible` ring on its back header (scripted focus) — papercut — yt, sutro.
28. Slider focus lands on the thumb and the container is the first tab stop (`media-time-slider`) — papercut — notflix, demuxed-2022.
29. `Controls.Root visibility="always"` (used by v10's audio skin) is undocumented for the rc.2 element — papercut — sutro-audio.
30. React ids inside skins (`<mask id>`) collide across players; worth a docs note to use `useId()` — papercut — x-mas.

## Pre-existing v10 gaps, reported by videojs/v10#2714

From the PR's `apps/sandbox/app/shared/player-style/README.md` and description; they apply to every port. "(confirmed)"
marks the ones the 14 ports hit, with the skins that did.

- Named icon slots become CSS: every glyph renders, data attributes hide the wrong ones. (confirmed: all 14)
- v10 never forces `fill` onto skin artwork; SVGs shipped with `fill="none"` render blank until the skin sets fill. (confirmed: minimal, demuxed-2022, halloween, sutro-audio, tailwind-audio)
- `--media-icon-size` is internal; skins outside the package size icons themselves.
- Sprite sheets (`<use href="#id">`) must come across with the skin. (confirmed: tailwind-audio)
- Volume level is reported on the mute button only. (confirmed: halloween)
- No reflected numeric state (`mediacurrenttime`, `mediavolume`); only `--media-slider-*` custom properties. (confirmed: reelplay, sutro)
- Binary assets need inlining at author time; there is no build-time `base64()`. (confirmed: reelplay, winamp)
- Named slots need a shadow-DOM skin (hence the shadow-DOM HTML edition here). (confirmed: all 14)
- Opt-in controls (`display: var(--media-x-display, none)`) are easy to miss in a theme's stylesheet. (confirmed: minimal)
- Artwork can carry several states in one SVG (`yt`); v10 leaves it alone. (confirmed: halloween)
- media-chrome ships default icons; v10 does not. (confirmed: instaplay, minimal, notflix, vimeonova)
- Breakpoints become container queries. (confirmed: all with breakpoints)
- `targetLiveWindow` is in store state but not reflected, so live themes cannot branch on DVR vs. standard latency. (confirmed: microvideo, minimal)
- Buttons disagree about when to hide: airplay/fullscreen on `availability !== 'available'`, captions on
  `unavailable`, cast on `unsupported`, pip on `!actionable`; cast can render as a dead control. (confirmed: microvideo, minimal, sutro, winamp, x-mas)
- Media Chrome and `@videojs/html` register eleven identical tag names; both must never share a document. (confirmed: the harness)
- From the migration guide: no configurable autohide delay, no `defaultduration`, no volume/mute persistence, no
  `seektoliveoffset`, no player-level active chapter, no cue points.
