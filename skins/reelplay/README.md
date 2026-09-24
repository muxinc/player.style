# @player.style/reelplay

The [Reelplay](https://player.style/skins/reelplay) skin for [Video.js 10](https://videojs.org): a nostalgic media
player inspired by the desktop players of a bygone era, by [@davekiss](https://github.com/davekiss). A blue title
strip, a grey transport bar with pixel-art play, pause, and stop buttons, dotted embossed sliders, and an LCD status
bar with the time. Ported from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/reelplay).

Ships an HTML custom element and a React component that share one stylesheet. The theme's pixel art (13 small PNGs,
about 4.7 KB as base64) is inlined in that stylesheet as data URIs, so `skin.css` is the only file to import.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/reelplay/html';
</script>

<video-player>
  <reelplay-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </reelplay-skin>
</video-player>
```

`<reelplay-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { ReelplaySkin } from '@player.style/reelplay/react';
import '@player.style/reelplay/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <ReelplaySkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </ReelplaySkin>
    </VideoPlayer>
  );
}
```

`ReelplaySkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Layout

The player is 16:9. The title strip and transport bar sit over the top of the picture and the status bar over the
bottom; all three fade out after a few idle seconds of playback and come back on pointer movement or when paused.
The seek arrows skip 30 seconds, as in the original. The bitrate and credits in the status bar are fixed text.

## Theming

Set these custom properties on `<reelplay-skin>` (or on `ReelplaySkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand teal: the fill of the scrubber and the volume slider (under the dotted pattern). | `#008484` |
| `--media-primary-color` | The skin's base text colour; the preview time and error dialog text through `--media-text-color`. | `#fff` (preview, dialog `rgb(238 238 238)`) |
| `--media-text-color` | The preview time and the error dialog text. | `--media-primary-color`, else `rgb(238 238 238)` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

The Media Chrome theme read `--media-accent-color` (default `#fff`) and `--media-secondary-color` into properties it
never painted with. Here the accent recolours the slider fills, the theme's one strong colour; the secondary colour is
still not read. The rest of the palette (the greys, the LCD green, the title gradient) is the theme's own, and the
fonts are the original's fixed `monaco` stacks.

```html
<reelplay-skin style="--media-accent-color: #f5c518">
```

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
