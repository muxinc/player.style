# @player.style/videojs-8

The [Video.js 8](https://player.style/skins/videojs-8) skin for [Video.js 10](https://videojs.org): the default look
Video.js shipped from 5.0 (2015) through 8.x, recreated from the 8.24.1 stylesheet. A flat slate bar with white icons,
an inline progress bar with a round handle and two time tooltips, a volume slider that slides out of the mute button,
remaining time, and the centred big play button with its thin white border.

Ships an HTML custom element and a React component that share one stylesheet.

For live streams, [`@player.style/videojs-8-live`](https://www.npmjs.com/package/@player.style/videojs-8-live) puts
the 7.x+ live control (a dot and LIVE) in place of the progress bar, on the live-video preset.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/videojs-8/html';
</script>

<video-player>
  <videojs-8-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </videojs-8-skin>
</video-player>
```

`<videojs-8-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { Videojs8Skin } from '@player.style/videojs-8/react';
import '@player.style/videojs-8/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <Videojs8Skin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </Videojs8Skin>
    </VideoPlayer>
  );
}
```

`Videojs8Skin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Before the first play: the poster and the big play button, which lightens while the pointer is anywhere on the
  player. The control bar appears once playback starts.
- Control bar, in the original's order: play (replay once ended), the volume panel, the progress bar, remaining time,
  captions (only when the media has text tracks), picture-in-picture (where supported) and fullscreen.
- Progress bar: 3px, 5px under the pointer, with a white tooltip over the play head, a black one at the pointer, and
  a 1px line through the track.
- The white icon glow on hover and keyboard focus, the ring spinner 0.3s into a stall, and the bar's 1s fade after two
  idle seconds of playback (it stays up while the pointer rests on it).
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen (the original's `userActions.hotkeys` set). Double-click the
  picture for fullscreen.

Like the original, the skin keeps fixed pixel sizes (a 30px bar, 18px icons, a 90 × 49 big play button) at every
player size.

## Theming

Set these custom properties on `<videojs-8-skin>` (or on `Videojs8Skin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-primary-color` | Icons, text and the big play button's border (the original's `$primary-foreground-color`). | `#fff` |
| `--media-secondary-color` | The slate behind the bar, the big play button and the spinner ring, drawn at 70%. The lighter slate of the tracks and hover states is derived from it, 33% lighter, as the original's SCSS did. | `#2b333f` |
| `--media-accent-color` | The progress and volume levels and their handles. | `--media-primary-color` |
| `--media-font-family` | The remaining time, the tooltips and the error text. | `arial, helvetica, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

With no tokens set the skin draws Video.js 8's colours exactly: `rgba(43, 51, 63, 0.7)` for the bar and
`rgba(115, 133, 159, 0.5)` for the tracks and hovers. Deriving the lighter slate needs CSS relative colours; browsers
without them keep the default lighter slate.

```html
<videojs-8-skin style="--media-secondary-color: #6a1b9a; --media-accent-color: #f5c518">
```

## Differences from Video.js 8

- Remaining time follows Video.js 10's time format, which pads the minutes of a media 10 minutes or longer
  (`-06:51` where Video.js 8 showed `-6:51`).
- The bar fades as soon as the pointer leaves the player while playing; Video.js 8 waited for its two-second idle
  timer.
- The spinner shows while playback stalls; Video.js 8 also showed it during seeks while paused.
- Captions are a toggle button rather than the original's captions menu.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default skin of [Video.js](https://github.com/videojs/video.js) 8.24.1, the design introduced
in Video.js 5.0. The original stylesheet and the VideoJS icons, whose SVG paths this skin inlines, are copyright the
Video.js contributors and available under the Apache License 2.0.

## License

MIT
