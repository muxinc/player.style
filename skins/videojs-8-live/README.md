# @player.style/videojs-8-live

The [Video.js 8](https://player.style/skins/videojs-8) skin for live video on [Video.js 10](https://videojs.org), on
the Video.js live-video preset. It recreates the live UI Video.js added in 7.x: a dot and LIVE where the progress bar
and remaining time were, grey behind the live edge and red at it. Clicking it seeks to the live edge. Everything
else is the on-demand skin: the slate bar, the slide-out volume, picture-in-picture, fullscreen, and the centred big
play button.

Ships an HTML custom element and a React component. The stylesheet is
[`@player.style/videojs-8`](https://www.npmjs.com/package/@player.style/videojs-8)'s, built into this package, so each
package installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/videojs-8-live/html';
</script>

<live-video-player>
  <videojs-8-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </videojs-8-live-skin>
</live-video-player>
```

`<videojs-8-live-skin>` renders the skin in its shadow root around your media. An optional `poster` slot takes an
`<img slot="poster">`; without it the skin shows the player's poster.

## React

```tsx
import { Video, LiveVideoPlayer } from '@videojs/react/live-video';
import { Videojs8LiveSkin } from '@player.style/videojs-8-live/react';
import '@player.style/videojs-8-live/skin.css';

export function Player() {
  return (
    <LiveVideoPlayer>
      <Videojs8LiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </Videojs8LiveSkin>
    </LiveVideoPlayer>
  );
}
```

`Videojs8LiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Control bar: play, the volume panel, the live control filling the space the progress bar took, then captions (only
  when the media has text tracks), picture-in-picture (where supported) and fullscreen.
- The live control is `.vjs-seek-to-live-control` from 8.24.1: an 8.33px dot 5px before LIVE in 10px type, `#888`
  behind the live edge and red at it.
- No progress bar, time tooltips or remaining time, and no seek hotkeys. Keyboard: `Space`/`k` play, `m` mute, `f`
  fullscreen.

## Theming

Everything in [`@player.style/videojs-8`'s Theming table](https://www.npmjs.com/package/@player.style/videojs-8)
applies here, plus the live button's two colours:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-live-button-icon-color` | The dot behind the live edge. | `#888` |
| `--media-live-button-indicator-color` | The dot at the live edge. | `#f00` |
| `--media-primary-color` | Icons, text (LIVE included) and the big play button's border. | `#fff` |
| `--media-secondary-color` | The slate behind the bar, the big play button and the spinner ring. | `#2b333f` |
| `--media-accent-color` | The volume level and its handle. | `--media-primary-color` |

```html
<videojs-8-live-skin style="--media-live-button-indicator-color: #e5091a">
```

## Differences from Video.js 8

- Video.js 8 showed a plain LIVE label by default and the dot only with its `liveui` option, which also kept the
  progress bar for DVR streams. This skin always draws the dot, which Video.js 10's live button can colour from its
  live-edge state, and has no DVR progress bar.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions for the live-video preset.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the live UI of [Video.js](https://github.com/videojs/video.js) 8.24.1. The original stylesheet and
the VideoJS icons are copyright the Video.js contributors and available under the Apache License 2.0.

## License

MIT
