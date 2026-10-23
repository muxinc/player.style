# Video.js 8

The default look Video.js shipped from 5.0 (2015) through 8.x, recreated for Video.js 10 from the 8.24.1 stylesheet
by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): a flat slate bar with white icons, an inline
progress bar with a round handle and two time tooltips, a volume slider that slides out of the mute button, remaining
time, and the centred big play button with its thin white border. The live-video preset recreates the live UI
Video.js added in 7.x: a dot and LIVE where the progress bar and remaining time were, grey behind the live edge and
red at it. See it on [skins.videojs.org](https://skins.videojs.org/skins/videojs-8).

## Differences from Video.js 8

- Remaining time follows Video.js 10's time format, which pads the minutes of a media 10 minutes or longer
  (`-06:51` where Video.js 8 showed `-6:51`).
- The bar fades as soon as the pointer leaves the player while playing; Video.js 8 waited for its two-second idle
  timer.
- The spinner shows while playback stalls; Video.js 8 also showed it during seeks while paused.
- Captions are a toggle button rather than the original's captions menu.
- Live: Video.js 8 showed a plain LIVE label by default and the dot only with its `liveui` option, which also kept the
  progress bar for DVR streams. This skin always draws the dot, which Video.js 10's live button colours from its
  live-edge state, and has no DVR progress bar.
- Phones and touch screens, which 8.x's skin predates: on a coarse pointer the buttons are 44px wide and every control
  takes taps from 14px above the 30px bar, so each tap target is 44 × 44. Hover states belong to pointers that hover:
  a tap leaves no glow behind, and the time tooltips show only while a finger drags the progress bar. A tap on the
  mute button slides the volume out, as on 8.x on Android; where the volume cannot be set (iOS) the panel is only the
  mute button. Below 425px the bar takes 8.x's responsive `small` layout: no remaining time and no volume slide-out.
- Theming: `--media-primary-color` (icons, text, the big play border; `#fff`), `--media-secondary-color` (the slate
  behind the bar, the big play button and the spinner ring, drawn at 70%, with the lighter slate of tracks and hovers
  derived from it; `#2b333f`), `--media-accent-color` (the progress and volume levels and their handles),
  `--media-live-button-icon-color` and `--media-live-button-indicator-color` (the live dot behind and at the edge;
  `#888`, `#f00`), plus `--media-font-family`, `--media-border-radius`, `--media-object-fit` and
  `--media-object-position`.

## Credits

A recreation of the default skin of [Video.js](https://github.com/videojs/video.js) 8.24.1, the design introduced in
Video.js 5.0. The original stylesheet and the VideoJS icons, whose SVG paths this skin inlines, are copyright the
Video.js contributors and available under the Apache License 2.0.
