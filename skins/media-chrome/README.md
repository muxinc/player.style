# Media Chrome

The look Media Chrome's web components ship with before any theme, recreated for Video.js 10 from media-chrome 4.19.2
by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): a bare, dark strip along the bottom in which
every control paints its own translucent background, 24px icons, thin range tracks with a round thumb, bold `1x` rate
text, and tooltips with Media Chrome's words on every button. The live-video preset recreates Media Chrome's live
control bar: `media-live-button`, a dot that turns red at the live edge, and LIVE, where the seek buttons, time range,
time display and playback rate were. See it on [skins.videojs.org](https://skins.videojs.org/skins/media-chrome).

The skin reads Media Chrome's own `--media-*` custom properties (`--media-primary-color`, `--media-secondary-color`,
`--media-control-background`, `--media-range-*`, `--media-tooltip-*`, `--media-<control>-display`, …), with the same
fallbacks and the same defaults, so CSS written for Media Chrome's components restyles it the same way. On top of them,
`--media-accent-color` tints the range fills and thumbs, which Media Chrome painted in its primary colour, and
`--media-live-button-icon-color` and `--media-live-button-indicator-color` colour the live dot.

## Differences from Media Chrome

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` and a
  `06:33` preview where Media Chrome showed `3:43 / 10:34` and `6:33`), so the time display is a digit wider.
- The playback rate button cycles Video.js 10's rates (1, 1.2, 1.5, 1.7, 2, then 0.2, 0.5, 0.7); Media Chrome went
  from 2 back to 1. `<` and `>` step through the same list rather than by 0.25.
- Only the current time toggles to the remaining time on click; Media Chrome's whole display did.
- A button's tooltip closes when the button is pressed; Media Chrome's stayed up while hovered.
- The time range's preview box is not clamped to the bar's edges, and chapter segments and titles are not drawn.
- Controls the media cannot use (captions without text tracks, picture-in-picture or fullscreen where unsupported,
  volume on iOS) drop out of the bar, as Media Chrome's themes did; the bare components stayed visible.
- The seek buttons' "30" takes the offset from the markup, not from a `seekoffset` attribute.
- Narrow players drop controls so the bar fits, where Media Chrome's bare bar, some 560px wide at its narrowest, ran
  past the player and clipped fullscreen away on a phone: below 640px the volume range (the mute button stays) and the
  playback rate, below 480px the seek buttons and picture-in-picture, below 400px the duration, and below 300px the
  time display. The live bar drops its volume range below 360px and picture-in-picture below 300px.
- On a touch screen the seek and rate buttons are at least 44px wide, and the current time takes taps over the time
  display's full 44px height.
- Live: Media Chrome's DVR layout (a live button next to the full on-demand controls, for a stream with a seekable
  window) is not recreated: Video.js 10 exposes no target live window to a skin.

## Credits

A recreation of the default component styles of [Media Chrome](https://github.com/muxinc/media-chrome) 4.19.2 by
Mux, whose icon SVG paths this skin inlines. Media Chrome is available under the MIT License.
