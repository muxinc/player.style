# Mux Player Classic

Mux Player's original theme, the default before Gerwig, recreated for Video.js 10 from the `classic` theme that ships
in `@mux/mux-player` 3.13.4 by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): a translucent black
control bar under a thin full-width time range, the storyboard preview above the pointer, a 100px volume range, a `1x`
rate button, the captions menu, and outlined play and seek glyphs in the middle of the picture. The live-video preset
is the theme's live layout: a `LIVE` badge leads the top bar, play sits alone in the centre, and the bar keeps no time
range, seek, time or rate controls. See it on [skins.videojs.org](https://skins.videojs.org/skins/mux-player-classic).

## Differences from Mux Player's classic theme

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where the
  theme showed `3:43 / 10:34`); the preview time likewise.
- The rate button cycles through the player's rates (Video.js 10's default list starts at 0.2x); the theme cycled
  `1 1.2 1.5 1.7 2`. `<` and `>` step through the same list rather than by 0.25.
- The CC badge follows every track in the captions menu, where the theme showed it for captions-kind tracks only.
- Menus fade in and out; the theme also slid them 2px and scaled them from 99%.
- With every control on offer the theme kept them all and squeezed their glyphs to a few pixels on a phone. The skin
  drops the least important ones instead, when the media offers them: cast under 460px wide, AirPlay under 430px, audio
  under 400px and quality under 370px. The live bar, which has no time or rate, drops cast under 360px and AirPlay
  under 330px, and keeps the rest.
- Touch screens (a coarse pointer) get 44px targets where the theme kept its 34 x 32 ones: the bar is 48px tall with
  44px-wide buttons, the time range takes touches 44px up from the bar with its track still across the bar's edge, the
  centre buttons reach past their edges and move up clear of the range on a short player, and the menu rows are 44px.
  The volume range gives way to the device's buttons below 640px wide, and the extras leave sooner: cast under 540px,
  AirPlay under 490px, audio under 450px, quality under 400px, picture-in-picture under 360px and the rate under 320px
  (live: cast under 400px, AirPlay under 360px, audio under 320px).
- Live: the theme's DVR layout (`target-live-window` above 0: the badge in the bar beside a time range and seek
  buttons) is not recreated, since Video.js 10 exposes no target live window to a skin; there are no seek keys.
- Theming: `--media-primary-color` (icons, and the text, which is `rgb(238 238 238)` when it is unset; `#fff`),
  `--media-secondary-color` (the control bar, the menus, the preview time and thumbnail backing;
  `rgb(0 0 0 / 0.75)`), `--media-accent-color` (the time and volume levels and the volume thumb, which the theme
  painted with the primary colour, so it falls back to it), `--media-live-button-icon-color` and
  `--media-live-button-indicator-color` (the `LIVE` dot away from and at the live edge; `rgb(140 140 140)`,
  `rgb(255 0 0)`), plus `--media-font-family`, `--media-border-radius`, `--media-object-fit` and
  `--media-object-position`. With no tokens set the skin draws the classic theme's colours exactly.

## Credits

A recreation of the `classic` theme of [Mux Player](https://github.com/muxinc/elements/tree/main/packages/mux-player)
as published in `@mux/mux-player` 3.13.4 (`@mux/mux-player/themes/classic`), the look Mux Player 1.x shipped by
default, with media-chrome's Live button for live video. The theme's template and its icons, whose SVG paths this skin
inlines, together with the media-chrome defaults it builds on (the seek and loading glyphs, the menu check mark and CC
badge), are copyright Mux, Inc. and available under the MIT License.
