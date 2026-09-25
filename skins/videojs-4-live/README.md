# @player.style/videojs-4-live

The [Video.js 4](https://player.style/skins/videojs-4-live) skin for live video on [Video.js 10](https://videojs.org),
on the live-video preset. Video.js 4.12.15 switched to a live layout when the stream had no end: the progress strip
and the time readout went away, and the word LIVE took their place after the play button. That layout is this
package. The on-demand package is [`@player.style/videojs-4`](https://player.style/skins/videojs-4).

Ships an HTML custom element and a React component. Both use `@player.style/videojs-4`'s stylesheet and theming
tokens: `skin.css` here is the same file, published under this package's name so it installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/videojs-4-live/html';
</script>

<live-video-player>
  <videojs-4-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </videojs-4-live-skin>
</live-video-player>
```

`<videojs-4-live-skin>` renders the theme in its shadow root around your media. The `poster` slot
(`<img slot="poster">`) is optional; without it the skin shows the player's poster.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { Videojs4LiveSkin } from '@player.style/videojs-4-live/react';
import '@player.style/videojs-4-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <Videojs4LiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </Videojs4LiveSkin>
    </LiveVideoPlayer>
  );
}
```

`Videojs4LiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## The LIVE label

- As in 4.12.15's `.vjs-live-display`: `LIVE` in `#ccc` 10px Arial on the bar's 30px line, centred in a 40px cell
  right after the 50px play button. The mute button, volume slider and fullscreen button stay on the right, and the
  big play button still waits in the top-left corner until the first play.
- It is a Video.js 10 live button: pressing it seeks to the live edge. 4.x's label was plain text. Here it glows white
  on hover and keyboard focus, as 4.x's controls did.
- 4.x drew no dot, so by default there is none. Set `--media-live-button-indicator-color` (at the live edge) and
  `--media-live-button-icon-color` (behind it) to show a 5px dot at the cell's left edge; the label stays centred.
- The label shows once Video.js reports the stream as live, as 4.x showed it only on `.vjs-live`; its cell stays
  reserved until then. Behind the live edge (a DVR window, which 4.x did not have) it dims to half opacity.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `↑`/`↓` volume. There are no seek shortcuts.
- On phones and touch screens the bar adapts as `@player.style/videojs-4` does: 44px tall with cells and LIVE at least
  44px wide on a coarse pointer, no hover states left behind by a tap, no double-tap zoom, and no volume slider where
  the media's volume cannot be set (iOS).

## Theming

The tokens are `@player.style/videojs-4`'s; see its README for the full table. The ones the live-video package
paints:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-primary-color` | The LIVE label, the icons and the volume handle. | `#ccc` |
| `--media-secondary-color` | The control bar and the big play button's resting background. | `rgb(7 20 30 / 0.7)` |
| `--media-accent-color` | The volume level's blue, under the white stripes. | `#66a8cc` |
| `--media-live-button-indicator-color` | The dot at the live edge. | `transparent` (no dot) |
| `--media-live-button-icon-color` | The dot behind the live edge. | `transparent` (no dot) |
| `--media-font-family` | The LIVE label. | `arial, sans-serif` |

```html
<videojs-4-live-skin style="--media-live-button-indicator-color: #e5091a">
```

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and
a README with the paste instructions for the live-video preset.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the live layout of the [Video.js](https://github.com/videojs/video.js) 4.12.15 default skin. Video.js
is © the Video.js contributors, licensed under the
[Apache License 2.0](https://github.com/videojs/video.js/blob/main/LICENSE).

## License

MIT
