# Mux Player

The look of [Mux Player](https://github.com/muxinc/elements/tree/main/packages/mux-player), recreated for Video.js 10
from `@mux/mux-player` 3.13.4 by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): a transparent bar
over a soft black gradient, 14px white icons that sit on a Mux pink square when hovered, a thin seek bar with a pop-up
thumb and a white-framed storyboard preview, white menus, tooltips on every button, the title in the top-left corner,
and the big black play button before the first play. Below 470px the title and most of the bar give way to a plain
play/pause in the middle, as in Mux Player. The live-video preset is Mux Player's live layout (`stream-type="live"`): a
Live indicator leads the title bar, and the seek bar, seek buttons, time and playback rate go. See it on
[skins.videojs.org](https://skins.videojs.org/skins/mux-player).

## Differences from Mux Player

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where
  Mux Player showed `3:43 / 10:34`). Only the current time switches to the time remaining; Mux Player's whole display
  was the switch.
- Tooltips read Video.js 10's labels (`Enter fullscreen`, `Seek backward 10 seconds`). Near the player's edge the
  tooltip's arrow stays in its middle instead of over the button.
- The playback rate row reads `1x`, `1.5x` as in Mux Player: React passes `formatRate` to the rate group, and the HTML
  markup uses `<ps-mux-player-rate-group>`, the stock rate group with that label, which `skin.ts` defines. It lists the
  player's rates, Video.js 10's `0.2x` to `2x` unless the player is configured otherwise, where Mux Player's default
  list was `1x` to `2x`.
- The storyboard preview is 2px shorter: Video.js 10 crops a 1px edge off each thumbnail.
- Captions do not rise above the bar while it shows.
- The Mux badge (`proudly-display-mux-badge`) is not part of the skin.
- Touch screens (a coarse pointer) get 44px targets where Mux Player kept its 30 x 26 buttons: the bar is 44px tall
  with 44px-wide buttons, the seek bar sits just above the bar and takes touches 44px up, the menu rows and the small
  centre play/pause reach 44px, and on a short player the centre moves up clear of the seek bar. The volume slider
  gives way to the device's buttons below 640px wide, the seek buttons leave between 470 and 560px, and cast and AirPlay
  leave sooner (cast below 700px, 320px in the phone layout; AirPlay between 470 and 660px). Tooltips and hover colours
  only show where a pointer hovers.
- With every control on offer Mux Player's bar ran out of the player on a narrow screen. The volume slider narrows to
  60px first, then cast leaves under 300px and between 470 and 530px, and AirPlay between 470 and 500px, when the media
  offers them.
- Live: the Live dot turns red whenever playback is at the live edge; Mux Player also greyed it while paused there.
  Mux Player's DVR layout (`target-live-window` above zero: the seek bar and seek buttons alongside the Live indicator)
  is not recreated, since Video.js 10 does not expose a target live window to a skin, and there are no seek keys, as
  Mux Player drops them for live streams.
- Mux Player's audio layout is not recreated.
- Theming: the properties Mux Player's `accent-color`, `primary-color` and `secondary-color` attributes set.
  `--media-accent-color` (button and play-button hovers, the seek fill and thumb, menu ticks, CC badges, the current
  rate; `#fa50b5`), `--media-primary-color` (icons, the buffered range, the preview and menu backgrounds, the volume
  thumb, and the bar text and volume fill, which are `rgb(238 238 238)` when it is unset; `#fff`),
  `--media-secondary-color` (the surface behind the bar's controls and the tooltips; transparent, tooltips
  `rgb(20 20 30 / 0.7)`), `--media-text-color` (text on the white preview and menus; `#000`),
  `--media-live-button-icon-color` and `--media-live-button-indicator-color` (the Live dot away from and at the live
  edge; `rgb(140 140 140)`, `rgb(255 0 0)`), plus `--media-font-family`, `--media-border-radius`,
  `--media-object-fit` and `--media-object-position`.

## Credits

A recreation of the design of [Mux Player](https://github.com/muxinc/elements) (`@mux/mux-player` 3.13.4), named
Gerwig (`media-theme-gerwig`) and built on [Media Chrome](https://github.com/muxinc/media-chrome). The theme's
layout, colours and SVG icons, which this skin inlines, are copyright Mux, Inc. and available under the MIT License.
