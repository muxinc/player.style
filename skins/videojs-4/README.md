# @player.style/videojs-4

The [Video.js 4](https://player.style/skins/videojs-4) skin for [Video.js 10](https://videojs.org): the 2013 Video.js
redesign, recreated from the default skin of Video.js 4.12.15, the last 4.x release. A translucent blue-black bar, a
striped cyan progress strip that thickens while the pointer is over the player, diamond handles, white glows, and the
big play button in the top-left corner.

Ships an HTML custom element and a React component that share one stylesheet, on the video preset. The skin for live
video, with 4.x's LIVE label in place of the progress strip and the time readout, is its own package,
[`@player.style/videojs-4-live`](https://player.style/skins/videojs-4-live).

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/videojs-4/html';
</script>

<video-player>
  <videojs-4-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </videojs-4-skin>
</video-player>
```

`<videojs-4-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { Videojs4Skin } from '@player.style/videojs-4/react';
import '@player.style/videojs-4/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <Videojs4Skin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </Videojs4Skin>
    </VideoPlayer>
  );
}
```

`Videojs4Skin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- The 4.12.15 layout at its original pixel sizes: a 30px bar in `rgb(7 20 30 / 0.7)` with `#ccc` icons; play, then
  `03:43 / 10:34` in 10px Arial on the left; mute, an always-visible 50 × 6px volume slider and fullscreen on the
  right. Minutes are padded once the duration reaches ten minutes, as in 4.x.
- The progress strip runs edge to edge along the bar's top: 3px at rest, 9px while the pointer is anywhere over the
  player (in 0.2s, back in 0.4s). The fill is `#66a8cc` under the original 6 × 6 white diagonal stripes, and the
  handles are glowing diamonds.
- The big play button: 120 × 78 with a 3px `#3b4249` border and 24px corners, 15px from the top-left corner. Its border
  turns white with a wide white glow while the pointer is over the player. The control bar appears after the first
  play.
- Icons are the glyphs of the Video.js 4 icon font, inlined as SVG, and glow white on hover and keyboard focus.
- The loading spinner is the font's thin broken ring, turning every 1.5s.
- Errors show 4.x's big grey X with the message in a strip along the bottom.
- A captions button, with the 4.x captions glyph, appears when the media has text tracks.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 5s, `↑`/`↓` volume. 4.x had no
  player-wide shortcuts; these are Video.js 10's.

## Differences from Video.js 4.12.15

- 4.x kept the bar up for 2s after the pointer left the player. Video.js 10 treats leaving as going idle, so while
  playing the bar starts its 1s fade as soon as the pointer leaves.
- 4.x counted playback as started for good. Video.js 10 reads a paused player at 0s as not started, so the big play
  button returns there (the bar stays while you scrub back to the start).
- The spinner shows while the media waits during playback, after Video.js 10's 0.5s delay. 4.x showed it at once, and
  also while seeking a paused player.
- The speaker shows its low, mid and high glyphs below 50%, below 75% and above, which are Video.js 10's volume
  levels. 4.x switched at one and two thirds.
- Captions toggle on and off, with the glow marking them on. 4.x opened a lowercase menu of tracks instead.

## Theming

Set these custom properties on `<videojs-4-skin>` (or on `Videojs4Skin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The blue under the stripes: the progress fill and the volume level. | `#66a8cc` |
| `--media-primary-color` | Icons, the time, the diamond handles and the spinner. | `#ccc` |
| `--media-secondary-color` | The control bar and the big play button's resting background. | `rgb(7 20 30 / 0.7)` |
| `--media-font-family` | The time and the error message. | `arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-live-button-indicator-color`, `--media-live-button-icon-color` | The live package's dot, at and behind the live edge. 4.x drew none. | `transparent` |

These map to the variables of the original's `video-js.less`: `@slider-bar-color`, `@main-font-color` and
`@control-bg-color` with `@control-bg-alpha`. The stripes stay white over any accent, as they were over any
`@slider-bar-color`.

```html
<videojs-4-skin style="--media-accent-color: #e5091a">
```

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and
a README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default skin of [Video.js](https://github.com/videojs/video.js) 4.12.15 (August 2015), designed
for Video.js 4.0 in 2013. The icons are glyphs of its `VideoJS` icon font and the stripes are its `@slider-bar-pattern`
image. Video.js is © the Video.js contributors, licensed under the
[Apache License 2.0](https://github.com/videojs/video.js/blob/main/LICENSE).

## License

MIT
